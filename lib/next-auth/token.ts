import { randomUUID as generateUUID } from 'node:crypto';
import { MongoServerError, ObjectId } from 'mongodb';

import {
  AppValidationError,
  AppValidationError,
  InvalidSecretError,
  ItemNotFoundError
} from 'named-app-errors';

import { getEnv } from 'multiverse/next-env';
import { debugFactory } from 'multiverse/debug-extended';
import { itemToObjectId } from 'multiverse/mongo-item';

import {
  validAuthenticationSchemes,
  type AuthenticationScheme
} from './authenticate';

import {
  type InternalAuthBearerEntry,
  type NewAuthEntry,
  type PublicAuthEntry,
  getAuthDb,
  isNewAuthEntry,
  publicAuthEntryProjection,
  toPublicAuthEntry
} from './db';

// ? Used by a comment eslint-disable-next-line
// @typescript-eslint/no-unused-vars
import { getConfig } from './constants';

import type { JsonObject, JsonValue } from 'type-fest';
import type { LiteralUnknownUnion } from 'types/global';

const debug = debugFactory('next-auth:token');

/**
 * The shape of the actual token and scheme data contained within an entry in
 * the well-known "auth" collection.
 */
export type Token = {
  /**
   * The authentication scheme this token supports.
   */
  scheme: AuthenticationScheme;
  /**
   * The actual token.
   */
  token: JsonObject;
};

/**
 * The potential token/scheme of one or more entries in the well-known "auth"
 * collection.
 */
export type TokenFilter = Partial<{
  /**
   * The authentication scheme of the target token(s).
   */
  scheme: string;
  /**
   * The target token(s).
   */
  token: Record<string, JsonValue>;
}>;

/**
 * An array of allowed "auth" full token entry attributes. Each array element
 * must correspond to a field in the {@link TokenAttributes} type and
 * vice-versa.
 */
export const validTokenAttributes = ['owner', 'isGlobalAdmin'] as const;

/**
 * A supported "auth" full token entry attribute (i.e. a field/property name as
 * a string) associated with a specific token and scheme.
 */
export type TokenAttribute = (typeof validTokenAttributes)[number];

/**
 * The shape of the attributes corresponding to a full token entry in the
 * well-known "auth" collection. Each property must correspond to an array
 * element in the {@link validTokenAttributes} array and vice-versa.
 */
// ! `owner` must be the only required property. All others must be optional.
export type TokenAttributes = {
  /**
   * A string (or stringified `ObjectId`) representing the owner of the token.
   */
  owner: string;
  /**
   * If `true`, the token grants access to potentially dangerous abilities via
   * the well-known "/sys" API endpoint.
   *
   * @default undefined
   */
  isGlobalAdmin?: boolean;
};

/**
 * The shape of a filter used to search through the well-known "auth"
 * collection.
 */
export type TokenAttributesFilter = Partial<{
  /**
   * As a string, this represents the target _owner_ of the target token. As an
   * array, this represents the target _owners_ of the target tokens, any of
   * which could be returned.
   */
  owner: string | string[];
  /**
   * The target global administrator status of the target token(s).
   */
  isGlobalAdmin: boolean;
}>;

/**
 * The shape of a bearer token object.
 */
export type BearerToken = {
  /**
   * The authentication scheme this token supports.
   */
  scheme: 'bearer';
  /**
   * The bearer token.
   */
  token: {
    bearer: string;
  };
};

/**
 * Transforms `filter`, the token attributes filter, into a MongoDb update
 * filter with equivalent meaning.
 */
function tokenAttributesFilterToMongoFilter(filter: TokenAttributesFilter) {
  return {
    // TODO: Queries on owner are covered by the index. Maybe others
    // TODO: should too?
    ...(filter.owner !== undefined
      ? { 'attributes.owner': { $in: [filter.owner].flat() } }
      : {}),
    ...(filter.isGlobalAdmin !== undefined
      ? { 'attributes.isGlobalAdmin': filter.isGlobalAdmin }
      : {}),
    deleted: false
  };
}

/**
 * Transforms `update`, a patch to update  {@link TokenAttributes} in the
 * MongoDb "auth" collection, into a valid MongoDb update expression.
 */
function tokenAttributesUpdateToMongoUpdate(update: TokenAttributes) {
  return {
    $set: {
      ...(update.owner !== undefined ? { 'attributes.owner': update.owner } : {}),
      ...(update.isGlobalAdmin !== undefined
        ? { 'attributes.isGlobalAdmin': update.isGlobalAdmin }
        : {})
    }
  };
}

/**
 * Type guard that returns `true` if `obj` satisfies the
 * {@link AuthenticationScheme} interface. Additional constraints may be
 * enforced such that `obj` is among a _subset_ of allowable schemes via the
 * `onlyAllowSubset` parameter.
 */
export function isAllowedScheme(
  obj: unknown,
  onlyAllowSubset?: AuthenticationScheme | AuthenticationScheme[]
): obj is AuthenticationScheme {
  return !![onlyAllowSubset || validAuthenticationSchemes]
    .flat()
    .includes(obj as AuthenticationScheme);
}

/**
 * Type guard that returns `true` if `obj` satisfies the {@link TokenAttributes}
 * interface.
 */
export function isTokenAttributes(
  obj: unknown,
  { partial = false } = {}
): obj is TokenAttributes {
  const attribute = obj as TokenAttributes;
  let returnValue = false;

  if (!!attribute && typeof attribute === 'object') {
    const isValidOwner = !!attribute.owner && typeof attribute.owner === 'string';

    const isValidGlobalAdmin =
      attribute.isGlobalAdmin === undefined ||
      typeof attribute.isGlobalAdmin === 'boolean';

    const allKeysAreValid = Object.keys(attribute).every((key) =>
      validTokenAttributes.includes(key as TokenAttribute)
    );

    if (allKeysAreValid) {
      returnValue = true;

      // eslint-disable-next-line unicorn/prefer-ternary
      if (partial) {
        returnValue &&= attribute.owner === undefined || isValidOwner;
      } else {
        returnValue &&= isValidOwner;
      }

      returnValue &&= isValidGlobalAdmin;
    }
  }

  return returnValue;
}

/**
 * Type guard that returns `true` if `obj` satisfies the
 * {@link TokenAttributesFilter} interface.
 */
export function isTokenAttributesFilter(obj: unknown): obj is TokenAttributesFilter {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if ('owner' in obj) {
    const ownerIsNotString = typeof obj.owner !== 'string';
    const ownerIsNotProperArray =
      !Array.isArray(obj.owner) ||
      !obj.owner.every((owner) => isTokenAttributes({ owner }));

    if (ownerIsNotProperArray && (ownerIsNotString || obj.owner === '')) {
      return false;
    }
  }

  if ('isGlobalAdmin' in obj && typeof obj.isGlobalAdmin !== 'boolean') {
    return false;
  }

  const allKeysAreValid = Object.keys(obj).every((key) =>
    validTokenAttributes.includes(key as TokenAttribute)
  );

  if (!allKeysAreValid) {
    return false;
  }

  return true;
}

/**
 * Derives a token and scheme from an authentication string (such as an
 * Authorization header). **Does not check the database for token existence**.
 * Throws on invalid/missing authentication string.
 *
 * Throws {@link InvalidSecretError} if invalid/missing data is provided.
 */
export async function deriveSchemeAndToken({
  authString,
  allowedSchemes
}: {
  /**
   * The authentication string used to derive a token and scheme.
   */
  authString?: string | undefined;
  /**
   * Accepted authentication schemes. By default, all schemes are accepted.
   */
  allowedSchemes?: AuthenticationScheme | AuthenticationScheme[];
}): Promise<BearerToken /* | OtherToken */>;
/**
 * Returns the token and scheme passed via `authData` if the token and scheme
 * are valid. **Does not check the database for token existence**. Throws on
 * invalid/missing token/scheme.
 */
export async function deriveSchemeAndToken({
  authData,
  allowedSchemes
}: {
  /**
   * The data that will be verified and returned as-is.
   */
  authData?: TokenFilter;
  /**
   * Accepted authentication schemes. By default, all schemes are accepted.
   */
  allowedSchemes?: AuthenticationScheme | AuthenticationScheme[];
}): Promise<BearerToken /* | OtherToken */>;
export async function deriveSchemeAndToken({
  authString,
  authData,
  allowedSchemes
}: {
  /**
   * The authentication string used to derive a token and scheme.
   */
  authString?: string | undefined;
  /**
   * The parameters used to derive a token and scheme.
   */
  authData?: TokenFilter;
  /**
   * Accepted authentication schemes. By default, all schemes are accepted.
   */
  allowedSchemes?: AuthenticationScheme | AuthenticationScheme[];
}): Promise<BearerToken /* | OtherToken */> {
  if (authString !== undefined) {
    if (
      !authString ||
      typeof authString !== 'string' ||
      !/^\S+ \S/.test(authString) ||
      authString.length > getEnv().AUTH_HEADER_MAX_LENGTH
    ) {
      throw new InvalidSecretError('auth string');
    }

    let scheme: AuthenticationScheme;
    const [rawScheme, ...rawCredentials] = authString.split(/\s/gi);
    const maybeScheme = rawScheme.toLowerCase();

    debug(`deriving token of scheme "${maybeScheme}" from auth string`);

    if (isAllowedScheme(maybeScheme, allowedSchemes)) {
      scheme = maybeScheme;
    } else {
      throw new InvalidSecretError('scheme (disallowed or unknown)');
    }

    const credentials = rawCredentials.flatMap((c) => c.split(',')).filter(Boolean);

    if (scheme === 'bearer') {
      if (credentials.length === 1) {
        return { scheme, token: { bearer: credentials[0] } };
      } else {
        throw new InvalidSecretError('token syntax');
      }
    } /*else if(scheme === '...') {
      ...
    }*/ else {
      throw new AppValidationError(
        `auth string handler for scheme "${scheme}" is not implemented`
      );
    }
  } else if (authData !== undefined) {
    if (!authData || typeof authData !== 'object') {
      throw new InvalidSecretError('auth data');
    }

    let scheme: AuthenticationScheme;
    const maybeScheme = authData.scheme?.toLowerCase();

    debug(`deriving token of scheme "${maybeScheme}" from auth data`);

    if (isAllowedScheme(maybeScheme, allowedSchemes)) {
      scheme = maybeScheme;
    } else {
      throw new InvalidSecretError('scheme (disallowed or unknown)');
    }

    if (scheme === 'bearer') {
      if (
        authData.token &&
        typeof authData.token === 'object' &&
        Object.keys(authData.token).length === 1 &&
        authData.token.bearer &&
        typeof authData.token.bearer === 'string'
      ) {
        return { scheme, token: { bearer: authData.token.bearer } };
      } else {
        throw new InvalidSecretError('token syntax');
      }
    } /*else if(scheme === '...') {
      ...
    }*/ else {
      throw new AppValidationError(
        `auth data handler for scheme "${scheme}" is not implemented`
      );
    }
  } else {
    throw new InvalidSecretError('invocation');
  }
}

/**
 * Generates a new full token entry in the well-known "auth" MongoDB collection,
 * including the provided attribute and scheme metadata. Throws on invalid entry
 * data.
 *
 * The current version of this function uses the `bearer` scheme to create v4
 * UUID "bearer tokens". This _implementation detail_ may change at any time.
 */
export async function createToken({
  data
}: {
  /**
   * Data used to generate a new "auth" entry.
   */
  data: LiteralUnknownUnion<NewAuthEntry>;
}): Promise<PublicAuthEntry> {
  if (isNewAuthEntry(data)) {
    const newToken: InternalAuthBearerEntry = {
      _id: new ObjectId(),
      deleted: false,
      attributes: data.attributes,
      scheme: 'bearer',
      // ! Due to how MongoDB works, it is EXTREMELY important that new entries'
      // ! token object properties are ALWAYS in an consistent, expected order.
      // ! This only matters when entry.token has more than one property.
      token: { bearer: generateUUID() }
    };

    try {
      await (await getAuthDb()).insertOne({ ...newToken });
    } catch (error) {
      throw error instanceof MongoServerError && error.code === 11_000
        ? new AppValidationError('token collision')
        : error;
    }

    return toPublicAuthEntry(newToken);
  } else {
    throw new InvalidSecretError('token data');
  }
}

/**
 * Returns the full token entry (`token`, `scheme`, and `attributes`)
 * corresponding to the given `_id` (`auth_id`) in the well-known "auth" MongoDB
 * collection.
 *
 * Throws if invalid/missing data is provided.
 */
export async function getTokenById({
  auth_id
}: {
  /**
   * The {@link ObjectId} of the token in the well-known "auth" MongoDb
   * collection. Throws if `auth_id` cannot be coerced into an {@link ObjectId}.
   */
  auth_id: string | ObjectId | undefined;
}): Promise<PublicAuthEntry> {
  const fullToken = await (
    await getAuthDb()
  ).findOne<PublicAuthEntry>(
    { _id: itemToObjectId(auth_id), deleted: false },
    { projection: publicAuthEntryProjection }
  );

  if (fullToken === null) {
    throw new ItemNotFoundError(auth_id, 'full token entry');
  }

  return fullToken;
}

/**
 * Returns the full token entry (`token`, `scheme`, and `attributes`) in the
 * well-known "auth" MongoDB collection that matches the given token and scheme
 * provided via `from`.
 *
 * Throws {@link InvalidSecretError} if invalid/missing data is provided.
 */
export async function getTokenByDerivation({
  from,
  allowedSchemes
}: {
  /**
   * If `from` is an object, it will be passed as `authData` to
   * {@link deriveSchemeAndToken}. Otherwise, if `from` is a string, it will be
   * passed as `authString` to {@link deriveSchemeAndToken}.
   */
  from: Token | string | undefined;
  /**
   * Accepted authentication schemes. By default, all schemes are accepted.
   */
  allowedSchemes?: AuthenticationScheme | AuthenticationScheme[];
}): Promise<PublicAuthEntry> {
  const { scheme, token } =
    typeof from === 'string'
      ? await deriveSchemeAndToken({ authString: from, allowedSchemes })
      : await deriveSchemeAndToken({ authData: from, allowedSchemes });

  const fullToken = await (
    await getAuthDb()
  ).findOne<PublicAuthEntry>(
    // ? To hit the index, order matters
    { scheme, token, deleted: false },
    { projection: publicAuthEntryProjection }
  );

  if (fullToken === null) {
    throw new InvalidSecretError('authentication scheme and token combination');
  }

  return fullToken;
}

/**
 * Returns at most `resultsPerPage` (from {@link getConfig}) full token entries
 * (`token`, `scheme`, and `attributes`) with matching attributes in the
 * well-known "auth" MongoDB collection.
 */
export async function getTokensByAttribute({
  filter,
  after_id
}: {
  /**
   * The token attributes used to filter and return tokens.
   */
  filter: LiteralUnknownUnion<TokenAttributesFilter>;
  /**
   * Only tokens with an `auth_id` after (less than) `after_id` will be returned.
   */
  after_id?: string | ObjectId | undefined;
}): Promise<PublicAuthEntry[]> {
  if (isTokenAttributesFilter(filter)) {
    const returnAll = Object.keys(filter).length === 0;

    return (await getAuthDb())
      .find<PublicAuthEntry>(
        // eslint-disable-next-line unicorn/no-array-callback-reference
        Object.assign(
          { deleted: false },
          after_id ? { _id: { $gt: itemToObjectId(after_id) } } : {},
          returnAll ? {} : tokenAttributesFilterToMongoFilter(filter)
        ),
        // eslint-disable-next-line unicorn/no-array-method-this-argument
        {
          projection: publicAuthEntryProjection,
          sort: { _id: 1 },
          limit: getConfig().resultsPerPage
        }
      )
      .toArray();
  } else {
    throw new InvalidSecretError('filter');
  }
}

/**
 * Updates a token's attributes by matching the provided data against the
 * well-known "auth" MongoDB collection. Throws on invalid/missing target or
 * entry data.
 *
 * **Note that the new `attributes` object will _patch_, not replace, the old
 * object.**
 */
export async function updateTokenAttributesById({
  auth_id,
  update
}: {
  /**
   * The {@link ObjectId} of the token in the well-known "auth" MongoDb
   * collection. Throws if `auth_id` cannot be coerced into an {@link ObjectId}.
   */
  auth_id: string | ObjectId | undefined;
  /**
   * The object used to patch the token's attributes.
   */
  update: LiteralUnknownUnion<TokenAttributes>;
}): Promise<number> {
  if (isTokenAttributes(update, { partial: true })) {
    const { modifiedCount } = await (
      await getAuthDb()
    ).updateOne(
      { _id: itemToObjectId(auth_id), deleted: false },
      tokenAttributesUpdateToMongoUpdate(update)
    );

    return modifiedCount;
  } else {
    throw new InvalidSecretError('update');
  }
}

/**
 * Updates all tokens with matching attributes in the well-known "auth" MongoDB
 * collection.
 */
export async function updateTokensAttributesByAttribute({
  filter,
  update
}: {
  /**
   * The token attributes used to filter and update tokens.
   */
  filter: LiteralUnknownUnion<TokenAttributesFilter>;
  /**
   * The object used to patch the tokens' attributes.
   */
  update: LiteralUnknownUnion<TokenAttributes>;
}): Promise<number> {
  if (isTokenAttributesFilter(filter)) {
    if (isTokenAttributes(update, { partial: true })) {
      if (Object.keys(update).length) {
        const { modifiedCount } = await (
          await getAuthDb()
        ).updateMany(
          tokenAttributesFilterToMongoFilter(filter),
          tokenAttributesUpdateToMongoUpdate(update)
        );

        return modifiedCount;
      } else {
        return 0;
      }
    } else {
      throw new InvalidSecretError('update');
    }
  } else {
    throw new InvalidSecretError('filter');
  }
}

/**
 * Deletes a full token entry by its `auth_id` from the well-known "auth"
 * MongoDB collection.
 *
 * Deleted tokens remain in the system but in a deactivated state. They cannot
 * be reactivated or otherwise interacted with after they are
 * deleted/deactivated.
 */
export async function deleteTokenById({
  auth_id
}: {
  auth_id: string | ObjectId | undefined;
}): Promise<number> {
  const { modifiedCount } = await (
    await getAuthDb()
  ).updateOne({ _id: itemToObjectId(auth_id) }, { $set: { deleted: true } });

  return modifiedCount;
}

/**
 * Deletes all full token entries with matching attributes in the well-known
 * "auth" MongoDB collection. Throws if an attempt is made to delete entries
 * with an empty filter.
 *
 * Deleted tokens remain in the system but in a deactivated state. They cannot
 * be reactivated or otherwise interacted with after they are
 * deleted/deactivated.
 */
export async function deleteTokensByAttribute({
  filter
}: {
  filter: LiteralUnknownUnion<TokenAttributesFilter>;
}): Promise<number> {
  if (isTokenAttributesFilter(filter) && Object.keys(filter).length) {
    const { modifiedCount } = await (
      await getAuthDb()
    ).updateMany(tokenAttributesFilterToMongoFilter(filter), {
      $set: { deleted: true }
    });

    return modifiedCount;
  }

  throw new InvalidSecretError('filter');
}
