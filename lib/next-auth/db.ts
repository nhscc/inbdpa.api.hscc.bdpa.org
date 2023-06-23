import { getDb } from 'multiverse/mongo-schema';

import {
  isTokenAttributes,
  type BearerToken,
  type Token,
  type TokenAttributes
} from './token';

import type { WithId } from 'mongodb';
import type { Merge, Exact } from 'type-fest';

/**
 * The base shape of an entry in the well-known "auth" collection. Consists of a
 * token, its scheme, and its attributes.
 *
 * **More complex entry types must extend from or intersect with this base
 * type.**
 */
export type InternalAuthEntry = WithId<
  {
    /**
     * Metadata indicating if an entry has been soft-deleted or not. If `deleted` is `true`, this entry will be ignored by the other CRUD functions.
     */
    deleted: boolean;
    /**
     * Metadata attributes associated with this "auth" entry.
     */
    attributes: TokenAttributes;
  } & Token
>;

/**
 * The base shape of a new entry in the well-known "auth" collection. More
 * complex entry types may or may not extend from or intersect with this type.
 *
 * Each API has the latitude to generate a token using whichever available
 * scheme is most convenient. Hence, the only external data necessary to create
 * a new auth entry is `attributes`.
 */
export type NewAuthEntry = Pick<InternalAuthEntry, 'attributes'>;

/**
 * The public base shape derived from an entry in the well-known "auth"
 * collection.
 */
export type PublicAuthEntry = Pick<
  InternalAuthEntry,
  'attributes' | 'scheme' | 'token'
> & {
  /**
   * A string representation of the ObjectId associated with this entry.
   */
  auth_id: string;
};

/**
 * The shape of a bearer token entry in the well-known "auth" collection.
 */
export type InternalAuthBearerEntry = Merge<InternalAuthEntry, BearerToken>;

/**
 * A MongoDB cursor projection that transforms an internal auth entry (or
 * "token") into a public auth entry.
 */
export const publicAuthEntryProjection = {
  _id: false,
  auth_id: { $toString: '$_id' },
  attributes: true,
  scheme: true,
  token: true
};

/**
 * Return the well-known "auth" collection after calling {@link getDb} on the
 * `'root'` database.
 */
export async function getAuthDb() {
  return (await getDb({ name: 'root' })).collection<InternalAuthEntry>('auth');
}

/**
 * Transform an internal entry from the well-known "auth" MongoDB collection
 * into one that is safe for consumption.
 */
export function toPublicAuthEntry(entry: InternalAuthEntry): PublicAuthEntry {
  const {
    _id,
    deleted: _,
    ...publicEntry
  } = { ...entry, auth_id: entry._id.toString() };

  return publicEntry satisfies Exact<PublicAuthEntry, typeof publicEntry>;
}

/**
 * Type guard that returns `true` if `obj` satisfies the {@link NewAuthEntry}
 * interface.
 */
export function isNewAuthEntry(obj: unknown): obj is NewAuthEntry {
  const entry = obj as NewAuthEntry;
  return isTokenAttributes(entry?.attributes);
}
