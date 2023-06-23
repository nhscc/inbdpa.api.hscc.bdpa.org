import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { asMockedFunction } from '@xunnamius/jest-types';

import { ErrorMessage } from 'universe/error';
import { useMockDateNow, dummyRootData } from 'multiverse/mongo-common';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';
import { objectIdPseudoSortPredicate } from 'multiverse/jest-mongo-object-id-pseudo-sort';
import { expectExceptionsWithMatchingErrors } from 'multiverse/jest-expect-matching-errors';

import * as NextAuthConstants from 'multiverse/next-auth/constants';

import {
  BANNED_BEARER_TOKEN,
  DEV_BEARER_TOKEN,
  DUMMY_BEARER_TOKEN,
  NULL_BEARER_TOKEN,
  createToken,
  deleteTokenById,
  deleteTokensByAttribute,
  deriveSchemeAndToken,
  getAuthDb,
  getTokenByDerivation,
  isAllowedScheme,
  isTokenAttributes,
  isTokenAttributesFilter,
  toPublicAuthEntry,
  validAuthenticationSchemes,
  getTokenById,
  getTokensByAttribute,
  updateTokensAttributesByAttribute,
  updateTokenAttributesById,
  type AuthenticationScheme,
  type TokenAttributes,
  type InternalAuthEntry,
  type PublicAuthEntry,
  type TokenAttribute
} from 'multiverse/next-auth';

setupMemoryServerOverride();
useMockDateNow();

jest.mock('node:crypto');

async function countAuthDbTokens() {
  return (await getAuthDb()).countDocuments({ deleted: false });
}

const mockRandomUUID = asMockedFunction(randomUUID);
const _validAuthenticationSchemes = validAuthenticationSchemes.slice();
const mutableAuthenticationSchemes =
  validAuthenticationSchemes as unknown as string[];

beforeEach(() => {
  mockRandomUUID.mockReturnValue(DUMMY_BEARER_TOKEN);
});

afterEach(() => {
  mutableAuthenticationSchemes.splice(
    0,
    mutableAuthenticationSchemes.length,
    ..._validAuthenticationSchemes
  );
});

test("ensure validTokenAttributes forms a bijection on TokenAttributes's fields", () => {
  expect.hasAssertions();

  // ? This is a TypeScript-only "test" where type checking will fail if
  // ? `TokenAttributes` does not match `validTokenAttributes`. While this won't
  // ? fail when run via jest, this will fail the pre-commit hook.
  const x: keyof TokenAttributes = '' as TokenAttribute;
  const y: TokenAttribute = '' as keyof TokenAttributes;
  expect(x).toBe(y);
});

describe('::createToken', () => {
  it('creates an auth entry and returns the new token', async () => {
    expect.hasAssertions();

    const crypto = jest.requireActual('node:crypto');
    const newToken1 = crypto.randomUUID();
    const newToken2 = crypto.randomUUID();

    mockRandomUUID.mockReturnValueOnce(newToken1);
    mockRandomUUID.mockReturnValueOnce(newToken2);

    const authDb = await getAuthDb();

    await expect(
      authDb.countDocuments({ 'attributes.owner': 'new-owner' })
    ).resolves.toBe(0);

    await expect(
      createToken({ data: { attributes: { owner: 'new-owner' } } })
    ).resolves.toStrictEqual<PublicAuthEntry>({
      auth_id: expect.any(String),
      attributes: { owner: 'new-owner' },
      scheme: 'bearer',
      token: { bearer: newToken1 }
    });

    await expect(
      authDb.countDocuments({
        attributes: { owner: 'new-owner' },
        scheme: 'bearer',
        token: { bearer: newToken1 }
      })
    ).resolves.toBe(1);

    await expect(
      createToken({
        data: { attributes: { owner: 'new-owner', isGlobalAdmin: true } }
      })
    ).resolves.toStrictEqual<PublicAuthEntry>({
      auth_id: expect.any(String),
      attributes: { owner: 'new-owner', isGlobalAdmin: true },
      scheme: 'bearer',
      token: { bearer: newToken2 }
    });

    await expect(
      authDb.countDocuments({
        attributes: { owner: 'new-owner', isGlobalAdmin: true },
        scheme: 'bearer',
        token: { bearer: newToken2 }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.countDocuments({ 'attributes.owner': 'new-owner' })
    ).resolves.toBe(2);
  });

  it('rejects if a duplicate token is accidentally generated', async () => {
    expect.hasAssertions();

    await expect(
      createToken({ data: { attributes: { owner: 'new-owner' } } })
    ).rejects.toMatchObject({
      message: expect.stringContaining('token collision')
    });
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    const errors: [params: Parameters<typeof createToken>[0], error: string][] = [
      [
        {} as unknown as Parameters<typeof createToken>[0],
        ErrorMessage.InvalidSecret('token data')
      ],
      [{ data: { attributes: undefined } }, ErrorMessage.InvalidSecret('token data')],
      [
        { data: { attributes: null as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: false as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: true as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: {} as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: { attributes: { isGlobalAdmin: null } as unknown as TokenAttributes }
        },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: { isGlobalAdmin: 1 } as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: { attributes: { isGlobalAdmin: true } as unknown as TokenAttributes }
        },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: { name: 'owner' } as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        { data: { attributes: { owner: null } as unknown as TokenAttributes } },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: {
            attributes: {
              owner: 'name',
              isGlobalAdmin: 1
            } as unknown as TokenAttributes
          }
        },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: {
            attributes: {
              owner: 'name',
              isGlobalAdmin: null
            } as unknown as TokenAttributes
          }
        },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: {
            attributes: {
              owner: 'name',
              isGlobalAdmin: 'true'
            } as unknown as TokenAttributes
          }
        },
        ErrorMessage.InvalidSecret('token data')
      ],
      [
        {
          data: {
            attributes: {
              owner: 'name',
              extra: 1
            } as unknown as TokenAttributes
          }
        },
        ErrorMessage.InvalidSecret('token data')
      ]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) => createToken(params));
  });
});

describe('::deleteTokenById', () => {
  it('deletes an auth entry by auth_id ans returns deleted count', async () => {
    expect.hasAssertions();

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length);

    await expect(
      deleteTokenById({ auth_id: dummyRootData.auth[1]._id })
    ).resolves.toBe(1);

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length - 1);

    await expect(
      deleteTokenById({ auth_id: dummyRootData.auth[0]._id })
    ).resolves.toBe(1);

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length - 2);
  });

  it('returns 0 deleted count if auth_id not found', async () => {
    expect.hasAssertions();

    await expect(deleteTokenById({ auth_id: new ObjectId() })).resolves.toBe(0);
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    const errors: [params: Parameters<typeof deleteTokenById>[0], error: string][] = [
      [
        {} as unknown as Parameters<typeof deleteTokenById>[0],
        ErrorMessage.InvalidItem('undefined', 'id')
      ],
      [{ auth_id: undefined }, ErrorMessage.InvalidItem('undefined', 'id')],
      [
        { auth_id: null as unknown as ObjectId },
        ErrorMessage.InvalidItem(null, 'id')
      ],
      [
        { auth_id: false as unknown as ObjectId },
        ErrorMessage.InvalidItem(false, 'id')
      ],
      [
        { auth_id: true as unknown as ObjectId },
        ErrorMessage.InvalidItem(true, 'id')
      ],
      [{ auth_id: {} as unknown as ObjectId }, ErrorMessage.InvalidItem({}, 'id')],
      [{ auth_id: '' }, ErrorMessage.InvalidItem('', 'id')],
      [{ auth_id: 'xyz' }, ErrorMessage.InvalidItem('xyz', 'id')],
      [{ auth_id: 5 as unknown as ObjectId }, ErrorMessage.InvalidItem(5, 'id')]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) =>
      deleteTokenById(params)
    );
  });

  it('ignores already-deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      deleteTokenById({ auth_id: dummyRootData.auth[1]._id })
    ).resolves.toBe(1);

    await expect(
      deleteTokenById({ auth_id: dummyRootData.auth[1]._id })
    ).resolves.toBe(0);
  });
});

describe('::deleteTokensByAttribute', () => {
  it('deletes an auth entry', async () => {
    expect.hasAssertions();

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length);
    await expect(
      deleteTokensByAttribute({ filter: dummyRootData.auth[1].attributes })
    ).resolves.toBe(1);

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length - 1);

    await expect(
      deleteTokensByAttribute({
        filter: dummyRootData.auth[0].attributes
      })
    ).resolves.toBe(1);

    await expect(countAuthDbTokens()).resolves.toBe(dummyRootData.auth.length - 2);
  });

  it('deletes multiple matching auth entries', async () => {
    expect.hasAssertions();

    await expect(
      deleteTokensByAttribute({
        filter: { owner: dummyRootData.auth.map((entry) => entry.attributes.owner) }
      })
    ).resolves.toBe(dummyRootData.auth.length);

    await expect(countAuthDbTokens()).resolves.toBe(0);
  });

  it('returns 0 deleted count if auth_id not found', async () => {
    expect.hasAssertions();

    await expect(
      deleteTokensByAttribute({ filter: { owner: 'does-not-exist' } })
    ).resolves.toBe(0);
  });

  it('rejects if attempting to delete all tokens (empty filter)', async () => {
    expect.hasAssertions();

    await expect(deleteTokensByAttribute({ filter: {} })).rejects.toMatchObject({
      message: ErrorMessage.InvalidSecret('filter')
    });
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    type Params = Parameters<typeof deleteTokensByAttribute>[0];
    const errors: [params: Params, error: string][] = [
      [{} as unknown as Params, ErrorMessage.InvalidSecret('filter')],
      [{ filter: undefined }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: null }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: false }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: true }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: { owner: '' } }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: { owner: 5 } }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: { isGlobalAdmin: null } }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: { fake: 'fake' } }, ErrorMessage.InvalidSecret('filter')]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) =>
      deleteTokensByAttribute(params)
    );
  });

  it('ignores already-deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      deleteTokensByAttribute({ filter: dummyRootData.auth[1].attributes })
    ).resolves.toBe(1);

    await expect(
      deleteTokensByAttribute({ filter: dummyRootData.auth[1].attributes })
    ).resolves.toBe(0);
  });
});

describe('::deriveSchemeAndToken', () => {
  it('handles schemes case-insensitively', async () => {
    expect.hasAssertions();

    const expected1 = await deriveSchemeAndToken({ authString: 'bearer 123' });

    await expect(
      deriveSchemeAndToken({ authString: 'bEaReR 123' })
    ).resolves.toStrictEqual(expected1);

    await expect(
      deriveSchemeAndToken({ authString: 'BeaRer 123' })
    ).resolves.toStrictEqual(expected1);

    await expect(
      deriveSchemeAndToken({ authString: 'BEARER 123' })
    ).resolves.toStrictEqual(expected1);

    const expected2 = await deriveSchemeAndToken({
      authData: { scheme: 'bearer', token: { bearer: '123' } }
    });

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'bearer', token: { bearer: '123' } }
      })
    ).resolves.toStrictEqual(expected2);

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'bearer', token: { bearer: '123' } }
      })
    ).resolves.toStrictEqual(expected2);

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'bearer', token: { bearer: '123' } }
      })
    ).resolves.toStrictEqual(expected2);
  });

  it('handles bearer scheme with token', async () => {
    expect.hasAssertions();

    await expect(
      deriveSchemeAndToken({ authString: 'bearer abc-123' })
    ).resolves.toStrictEqual({
      scheme: 'bearer',
      token: { bearer: 'abc-123' }
    });

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'bearer', token: { bearer: 'abc-123' } }
      })
    ).resolves.toStrictEqual({
      scheme: 'bearer',
      token: { bearer: 'abc-123' }
    });
  });

  it('handles allowedSchemes as an AuthenticationScheme or an array of AuthSchemes', async () => {
    expect.hasAssertions();

    await expect(
      deriveSchemeAndToken({ authString: 'bearer abc-123', allowedSchemes: 'bearer' })
    ).resolves.toStrictEqual({
      scheme: 'bearer',
      token: { bearer: 'abc-123' }
    });

    await expect(
      deriveSchemeAndToken({
        authData: {
          scheme: 'bearer',
          token: { bearer: 'abc-123' }
        },
        allowedSchemes: ['bearer']
      })
    ).resolves.toStrictEqual({
      scheme: 'bearer',
      token: { bearer: 'abc-123' }
    });

    // ? Unlike with authorizeHeader and its constraints, duplicate AuthSchemes
    // ? are not a big deal here and so are not checked against.
    await expect(
      deriveSchemeAndToken({
        authData: {
          scheme: 'bearer',
          token: { bearer: 'abc-123' }
        },
        allowedSchemes: ['bearer', 'bearer']
      })
    ).resolves.toStrictEqual({
      scheme: 'bearer',
      token: { bearer: 'abc-123' }
    });
  });

  it('rejects bearer scheme with multipart token', async () => {
    expect.hasAssertions();

    await expect(
      deriveSchemeAndToken({
        authString: 'bearer abc-123,\ndef-234,ghi-345,\n\njkl-456,mno-567'
      })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('token syntax'));

    await expect(
      deriveSchemeAndToken({
        authData: {
          scheme: 'bearer',
          token: { bearer: ['abc-123', 'def-234', 'ghi-345', 'jkl-456', 'mno-567'] }
        }
      })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('token syntax'));
  });

  it('rejects on missing and null data', async () => {
    expect.hasAssertions();

    await expect(deriveSchemeAndToken({ authString: '' })).rejects.toThrow(
      ErrorMessage.InvalidSecret('auth string')
    );

    await expect(deriveSchemeAndToken({ authString: undefined })).rejects.toThrow(
      ErrorMessage.InvalidSecret('invocation')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(deriveSchemeAndToken({ authString: null as any })).rejects.toThrow(
      ErrorMessage.InvalidSecret('auth string')
    );

    await expect(
      deriveSchemeAndToken({ authData: { scheme: 'bearer', token: { bearer: '' } } })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('token syntax'));

    await expect(
      deriveSchemeAndToken({ authData: { scheme: 'bearer', token: { bearer: '' } } })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('token syntax'));

    await expect(
      deriveSchemeAndToken({ authData: { scheme: '', token: { bearer: 'abc-123' } } })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deriveSchemeAndToken({ authData: { something: 'else' } as any })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));

    await expect(deriveSchemeAndToken({ authData: undefined })).rejects.toThrow(
      ErrorMessage.InvalidSecret('invocation')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(deriveSchemeAndToken({ authData: null as any })).rejects.toThrow(
      ErrorMessage.InvalidSecret('auth data')
    );
  });

  it('rejects on badly formatted headers', async () => {
    expect.hasAssertions();

    await expect(deriveSchemeAndToken({ authString: 'bearer' })).rejects.toThrow(
      ErrorMessage.InvalidSecret('auth string')
    );

    await expect(
      deriveSchemeAndToken({ authString: 'bearer-bearer' })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('auth string'));
  });

  it('rejects on unknown schemes', async () => {
    expect.hasAssertions();

    await expect(
      deriveSchemeAndToken({ authString: 'unknown xyz', allowedSchemes: 'bearer' })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'unknown', token: { bearer: 'xyz' } },
        allowedSchemes: 'bearer'
      })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));
  });

  it('rejects if using a disallowed scheme', async () => {
    expect.hasAssertions();

    await expect(
      deriveSchemeAndToken({
        authString: 'bearer 123',
        allowedSchemes: ['none' as unknown as AuthenticationScheme]
      })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));

    await expect(
      deriveSchemeAndToken({
        authData: { scheme: 'bearer', token: { bearer: '123' } },
        allowedSchemes: 'none' as unknown as AuthenticationScheme
      })
    ).rejects.toThrow(ErrorMessage.InvalidSecret('scheme (disallowed or unknown)'));
  });

  it('rejects if handler for scheme is mistakenly unimplemented', async () => {
    expect.hasAssertions();

    mutableAuthenticationSchemes.push('none');

    await expect(deriveSchemeAndToken({ authString: 'none 123' })).rejects.toThrow(
      'auth string handler for scheme "none" is not implemented'
    );

    await expect(
      deriveSchemeAndToken({ authData: { scheme: 'none', token: { bearer: '123' } } })
    ).rejects.toThrow('auth data handler for scheme "none" is not implemented');
  });
});

describe('::getTokenById', () => {
  it('returns tokens if bearer token exists in database', async () => {
    expect.hasAssertions();

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[1]._id
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[1]._id
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[0]._id
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[0]));
  });

  // ? Rejecting banned tokens is handled at a different layer than validation
  it('returns tokens even if bearer token is banned', async () => {
    expect.hasAssertions();

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[2]._id
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[2]));
  });

  it('throws if bearer token does not exist in database', async () => {
    expect.hasAssertions();

    await expect(
      getTokenById({
        auth_id: new ObjectId()
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('was not found')
    });
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[1]._id
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await (
      await getAuthDb()
    ).updateOne({ _id: dummyRootData.auth[1]._id }, { $set: { deleted: true } });

    await expect(
      getTokenById({
        auth_id: dummyRootData.auth[1]._id
      })
    ).rejects.toMatchObject({ message: expect.stringContaining('was not found') });
  });
});

describe('::getTokenByDerivation', () => {
  it('returns token if bearer token exists in database', async () => {
    expect.hasAssertions();

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DUMMY_BEARER_TOKEN } }
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DEV_BEARER_TOKEN } }
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[0]));
  });

  // ? Rejecting banned tokens is handled at a different layer than validation
  it('returns token even if bearer token is banned', async () => {
    expect.hasAssertions();

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: BANNED_BEARER_TOKEN } }
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[2]));
  });

  it('throws if bearer token does not exist in database', async () => {
    expect.hasAssertions();

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: NULL_BEARER_TOKEN } }
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('scheme and token combination')
    });
  });

  it('respects allowedSchemes parameter', async () => {
    expect.hasAssertions();

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DUMMY_BEARER_TOKEN } }
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DUMMY_BEARER_TOKEN } },
        allowedSchemes: ['none' as AuthenticationScheme]
      })
    ).rejects.toMatchObject({
      message: ErrorMessage.InvalidSecret('scheme (disallowed or unknown)')
    });
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DUMMY_BEARER_TOKEN } }
      })
    ).resolves.toStrictEqual(toPublicAuthEntry(dummyRootData.auth[1]));

    await (
      await getAuthDb()
    ).updateOne({ _id: dummyRootData.auth[1]._id }, { $set: { deleted: true } });

    await expect(
      getTokenByDerivation({
        from: { scheme: 'bearer', token: { bearer: DUMMY_BEARER_TOKEN } }
      })
    ).rejects.toMatchObject({ message: expect.stringContaining('combination') });
  });
});

describe('::getTokensByAttribute', () => {
  it('returns array of all auth entries with matching attributes', async () => {
    expect.hasAssertions();

    const entries = dummyRootData.auth.slice(0, -1);
    const owners = entries.map((entry) => entry.attributes.owner);

    const newAuthEntry1: InternalAuthEntry = {
      _id: new ObjectId(),
      deleted: false,
      attributes: { owner: owners[0] },
      scheme: 'bearer',
      token: { bearer: '(new) ' + jest.requireActual('node:crypto').randomUUID() }
    };

    const newAuthEntry2: InternalAuthEntry = {
      _id: new ObjectId(),
      deleted: false,
      attributes: { owner: owners[1] },
      scheme: 'bearer',
      token: { bearer: '(new) ' + jest.requireActual('node:crypto').randomUUID() }
    };

    await expect(
      getTokensByAttribute({ filter: { owner: owners } })
    ).resolves.toStrictEqual(entries.map((entry) => toPublicAuthEntry(entry)));

    await (await getAuthDb()).insertMany([newAuthEntry1, newAuthEntry2]);

    await expect(
      getTokensByAttribute({ filter: { owner: owners } })
    ).resolves.toStrictEqual(
      [...entries, newAuthEntry1, newAuthEntry2]
        .sort((a, b) => objectIdPseudoSortPredicate('ascending')(a, b))
        .map((entry) => toPublicAuthEntry(entry))
    );
  });

  // ? Rejecting banned tokens is handled at a different layer than validation
  it('returns tokens even if bearer token is banned', async () => {
    expect.hasAssertions();

    await expect(
      getTokensByAttribute({ filter: dummyRootData.auth[2].attributes })
    ).resolves.toStrictEqual([toPublicAuthEntry(dummyRootData.auth[2])]);
  });

  it('returns empty array if no matching attributes exist', async () => {
    expect.hasAssertions();

    await expect(
      getTokensByAttribute({ filter: { owner: ['does-not-exist'] } })
    ).resolves.toStrictEqual([]);

    await expect(
      getTokensByAttribute({
        filter: { owner: ['does-not-exist-1', 'does-not-exist-2'] }
      })
    ).resolves.toStrictEqual([]);

    await expect(
      getTokensByAttribute({ filter: { owner: [] } })
    ).resolves.toStrictEqual([]);
  });

  it('returns all auth entries if empty filter provided', async () => {
    expect.hasAssertions();

    await expect(getTokensByAttribute({ filter: {} })).resolves.toStrictEqual(
      dummyRootData.auth.map((entry) => toPublicAuthEntry(entry))
    );
  });

  it('respects pagination via after_id', async () => {
    expect.hasAssertions();

    await expect(getTokensByAttribute({ filter: {} })).resolves.toStrictEqual(
      dummyRootData.auth.map((entry) => toPublicAuthEntry(entry))
    );

    await expect(
      getTokensByAttribute({
        filter: {},
        after_id: dummyRootData.auth[0]._id
      })
    ).resolves.toStrictEqual(
      dummyRootData.auth.slice(1).map((entry) => toPublicAuthEntry(entry))
    );

    await expect(
      getTokensByAttribute({
        filter: {},
        after_id: dummyRootData.auth.at(-1)?._id
      })
    ).resolves.toStrictEqual([]);
  });

  it('respects config.resultsPerPage', async () => {
    expect.hasAssertions();

    await expect(getTokensByAttribute({ filter: {} })).resolves.toStrictEqual(
      dummyRootData.auth.map((entry) => toPublicAuthEntry(entry))
    );

    jest.spyOn(NextAuthConstants, 'getConfig').mockImplementation(() => {
      return {
        resultsPerPage: 1
      };
    });

    await expect(getTokensByAttribute({ filter: {} })).resolves.toStrictEqual(
      dummyRootData.auth.slice(0, 1).map((entry) => toPublicAuthEntry(entry))
    );

    jest.spyOn(NextAuthConstants, 'getConfig').mockImplementation(() => {
      return {
        resultsPerPage: dummyRootData.auth.length - 1
      };
    });

    await expect(getTokensByAttribute({ filter: {} })).resolves.toStrictEqual(
      dummyRootData.auth.slice(0, -1).map((entry) => toPublicAuthEntry(entry))
    );
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    type Params = Parameters<typeof getTokensByAttribute>[0];
    const errors: [params: Params, error: string][] = [
      [
        { filter: { owner: [false] as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: { owner: [true] as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: { owner: true as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [{ filter: { owner: [''] } }, ErrorMessage.InvalidSecret('filter')],
      [
        { filter: { owner: [5] as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: { owner: 5 as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: { owner: [null] as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: { owner: [undefined] as unknown as Params } },
        ErrorMessage.InvalidSecret('filter')
      ],
      [{ filter: { owners: ['owner-1'] } }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: { bad: 'not-good' } }, ErrorMessage.InvalidSecret('filter')]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) =>
      getTokensByAttribute(params)
    );
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      getTokensByAttribute({ filter: dummyRootData.auth[1].attributes })
    ).resolves.toStrictEqual([toPublicAuthEntry(dummyRootData.auth[1])]);

    await (
      await getAuthDb()
    ).updateOne({ _id: dummyRootData.auth[1]._id }, { $set: { deleted: true } });

    await expect(
      getTokensByAttribute({ filter: dummyRootData.auth[1].attributes })
    ).resolves.toStrictEqual([]);
  });
});

describe('::isAllowedScheme', () => {
  it('returns true only if passed an AuthenticationScheme', async () => {
    expect.hasAssertions();

    expect(isAllowedScheme('bearer')).toBeTrue();
    expect(isAllowedScheme('nope')).toBeFalse();

    mutableAuthenticationSchemes.push('nope');

    expect(isAllowedScheme('nope')).toBeTrue();
  });

  it('returns true only if passed an allowed AuthenticationScheme when using onlyAllowSubset', async () => {
    expect.hasAssertions();

    expect(isAllowedScheme('bearer')).toBeTrue();
    expect(isAllowedScheme('bearer', [])).toBeFalse();
    expect(isAllowedScheme('bearer', ['nope' as AuthenticationScheme])).toBeFalse();
    expect(isAllowedScheme('nope', ['nope' as AuthenticationScheme])).toBeTrue();
    expect(isAllowedScheme('nope', 'nope' as AuthenticationScheme)).toBeTrue();
    expect(isAllowedScheme('nope', 'bearer')).toBeFalse();
  });
});

describe('::isTokenAttributes', () => {
  it('returns true only if passed TokenAttributes', async () => {
    expect.hasAssertions();

    expect(isTokenAttributes(undefined)).toBeFalse();
    expect(isTokenAttributes(null)).toBeFalse();
    expect(isTokenAttributes(1)).toBeFalse();
    expect(isTokenAttributes('1')).toBeFalse();
    expect(isTokenAttributes({ owner: true })).toBeFalse();
    expect(isTokenAttributes({ owner: null })).toBeFalse();
    expect(isTokenAttributes({ owner: undefined })).toBeFalse();
    expect(isTokenAttributes({ owner: 'owner', isGlobalAdmin: 1 })).toBeFalse();
    expect(isTokenAttributes({ owner: 'owner', isGlobalAdmin: 'true' })).toBeFalse();
    expect(isTokenAttributes({ owner: 'owner' })).toBeTrue();
    expect(isTokenAttributes({ owner: 'owner', isGlobalAdmin: false })).toBeTrue();
    expect(isTokenAttributes({ isGlobalAdmin: false })).toBeFalse();
  });

  it('returns true if passed partial TokenAttributes in patch mode', async () => {
    expect.hasAssertions();

    expect(isTokenAttributes(undefined, { partial: true })).toBeFalse();
    expect(isTokenAttributes(null, { partial: true })).toBeFalse();
    expect(isTokenAttributes(1, { partial: true })).toBeFalse();
    expect(isTokenAttributes('1', { partial: true })).toBeFalse();
    expect(isTokenAttributes({}, { partial: true })).toBeTrue();
    expect(isTokenAttributes({ owner: true }, { partial: true })).toBeFalse();
    expect(isTokenAttributes({ owner: null }, { partial: true })).toBeFalse();
    expect(isTokenAttributes({ owner: undefined }, { partial: true })).toBeTrue();
    expect(isTokenAttributes({ owner: '' })).toBeFalse();

    expect(
      isTokenAttributes({ owner: 'owner', isGlobalAdmin: 1 }, { partial: true })
    ).toBeFalse();

    expect(
      isTokenAttributes({ owner: 'owner', isGlobalAdmin: 'true' }, { partial: true })
    ).toBeFalse();

    expect(isTokenAttributes({ owner: 'owner' }, { partial: true })).toBeTrue();

    expect(
      isTokenAttributes({ owner: 'owner', isGlobalAdmin: false }, { partial: true })
    ).toBeTrue();

    expect(isTokenAttributes({ isGlobalAdmin: false }, { partial: true })).toBeTrue();
  });

  it('returns false if passed a superset of TokenAttributes', async () => {
    expect.hasAssertions();

    expect(isTokenAttributes({ owner: 'owner', extra: 'prop' })).toBeFalse();

    expect(
      isTokenAttributes({ owner: 'owner', extra: 'prop' }, { partial: true })
    ).toBeFalse();
  });

  it('returns false if passed an empty object', async () => {
    expect.hasAssertions();
    expect(isTokenAttributes({})).toBeFalse();
  });

  it('returns false if passed an empty string owner', async () => {
    expect.hasAssertions();

    expect(isTokenAttributes({ owner: '' })).toBeFalse();
    expect(isTokenAttributes({ owner: [''] })).toBeFalse();
    expect(isTokenAttributes({ owner: ['owner-1', ''] })).toBeFalse();
  });
});

describe('::isTokenAttributesFilter', () => {
  it('returns true only if passed TokenAttributesFilter', async () => {
    expect.hasAssertions();

    expect(isTokenAttributesFilter(undefined)).toBeFalse();
    expect(isTokenAttributesFilter(null)).toBeFalse();
    expect(isTokenAttributesFilter(1)).toBeFalse();
    expect(isTokenAttributesFilter('1')).toBeFalse();
    expect(isTokenAttributesFilter({ owner: true })).toBeFalse();
    expect(isTokenAttributesFilter({ owner: null })).toBeFalse();
    expect(isTokenAttributesFilter({ owner: undefined })).toBeFalse();
    expect(isTokenAttributesFilter({ owner: 'owner', isGlobalAdmin: 1 })).toBeFalse();

    expect(
      isTokenAttributesFilter({ owner: 'owner', isGlobalAdmin: 'true' })
    ).toBeFalse();

    expect(isTokenAttributesFilter({ owner: 'owner' })).toBeTrue();

    expect(
      isTokenAttributesFilter({ owner: 'owner', isGlobalAdmin: false })
    ).toBeTrue();

    expect(isTokenAttributesFilter({ isGlobalAdmin: false })).toBeTrue();

    expect(
      isTokenAttributesFilter({ owner: ['owner'], isGlobalAdmin: false })
    ).toBeTrue();

    expect(
      isTokenAttributesFilter({ owner: ['owner-1', 'owner-2'], isGlobalAdmin: false })
    ).toBeTrue();
  });

  it('returns false if passed a superset of TokenAttributesFilter', async () => {
    expect.hasAssertions();
    expect(isTokenAttributesFilter({ owner: ['owner'], extra: 'prop' })).toBeFalse();
  });

  it('returns true if passed an empty object', async () => {
    expect.hasAssertions();
    expect(isTokenAttributesFilter({})).toBeTrue();
  });

  it('returns false if passed an empty string owner', async () => {
    expect.hasAssertions();

    expect(isTokenAttributesFilter({ owner: '' })).toBeFalse();
    expect(isTokenAttributesFilter({ owner: [''] })).toBeFalse();
    expect(isTokenAttributesFilter({ owner: ['owner-1', ''] })).toBeFalse();
  });
});

describe('::updateTokenAttributesById', () => {
  it('updates (patches) an existing auth entry', async () => {
    expect.hasAssertions();

    const authDb = await getAuthDb();

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: { isGlobalAdmin: false }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[0]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[0],
      attributes: { ...dummyRootData.auth[0].attributes, isGlobalAdmin: false }
    });

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[1]._id,
        update: { owner: 'name' }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[1]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[1],
      attributes: { ...dummyRootData.auth[1].attributes, owner: 'name' }
    });

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: { owner: 'name', isGlobalAdmin: true }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[0]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[0],
      attributes: {
        ...dummyRootData.auth[0].attributes,
        owner: 'name',
        isGlobalAdmin: true
      }
    });

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[1]._id,
        update: { isGlobalAdmin: true }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[1]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[1],
      attributes: {
        ...dummyRootData.auth[1].attributes,
        owner: 'name',
        isGlobalAdmin: true
      }
    });
  });

  it('allows empty update (no-op)', async () => {
    expect.hasAssertions();

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: {}
      })
    ).resolves.toBe(0);

    await expect((await getAuthDb()).find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth
    );
  });

  it('returns 0 when demonstrating idempotency', async () => {
    expect.hasAssertions();

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: dummyRootData.auth[0].attributes
      })
    ).resolves.toBe(0);
  });

  it('returns 0 updated count if auth_id not found', async () => {
    expect.hasAssertions();

    await expect(
      updateTokenAttributesById({
        auth_id: new ObjectId(),
        update: { isGlobalAdmin: false }
      })
    ).resolves.toBe(0);
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    const auth_id = new ObjectId();

    const errors: [
      params: Parameters<typeof updateTokenAttributesById>[0],
      error: string
    ][] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [{} as any, ErrorMessage.InvalidSecret('update')],
      [
        { auth_id: undefined, update: {} },
        ErrorMessage.InvalidItem('undefined', 'id')
      ],
      [{ auth_id: null, update: {} }, ErrorMessage.InvalidItem(null, 'id')],
      [{ auth_id: false, update: {} }, ErrorMessage.InvalidItem(false, 'id')],
      [{ auth_id: true, update: {} }, ErrorMessage.InvalidItem(true, 'id')],
      [{ auth_id: {}, update: {} }, ErrorMessage.InvalidItem({}, 'id')],
      [{ auth_id: 'xyz123', update: {} }, ErrorMessage.InvalidItem('xyz123', 'id')],

      [{ auth_id, update: undefined }, ErrorMessage.InvalidSecret('update')],
      [{ auth_id, update: null }, ErrorMessage.InvalidSecret('update')],
      [{ auth_id, update: false }, ErrorMessage.InvalidSecret('update')],
      [{ auth_id, update: true }, ErrorMessage.InvalidSecret('update')],
      [{ auth_id, update: { owner: '' } }, ErrorMessage.InvalidSecret('update')],
      [
        { auth_id, update: { isGlobalAdmin: 5 } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        { auth_id, update: { owners: ['prop'] } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        { auth_id, update: { owner: ['array-form-is-only-for-filter'] } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          auth_id,
          update: { isGlobalAdmin: null }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          auth_id,
          update: { isGlobalAdmin: 1 }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [{ auth_id, update: { name: 'owner' } }, ErrorMessage.InvalidSecret('update')],
      [{ auth_id, update: { owner: null } }, ErrorMessage.InvalidSecret('update')],
      [
        {
          auth_id,
          update: {
            owner: 'name',
            isGlobalAdmin: 1
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          auth_id,
          update: {
            owner: 'name',
            isGlobalAdmin: null
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          auth_id,
          update: {
            owner: 'name',
            isGlobalAdmin: 'true'
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          auth_id,
          update: {
            owner: 'name',
            extra: 1
          }
        },
        ErrorMessage.InvalidSecret('update')
      ]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) =>
      updateTokenAttributesById(params)
    );
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: { owner: 'xyz123' }
      })
    ).resolves.toBe(1);

    await (await getAuthDb()).updateMany({}, { $set: { deleted: true } });

    await expect(
      updateTokenAttributesById({
        auth_id: dummyRootData.auth[0]._id,
        update: { owner: 'abc987' }
      })
    ).resolves.toBe(0);
  });
});

describe('::updateTokensAttributesByAttribute', () => {
  it('updates (patches) an existing auth entry', async () => {
    expect.hasAssertions();

    const authDb = await getAuthDb();

    await expect(
      updateTokensAttributesByAttribute({
        filter: dummyRootData.auth[0].attributes,
        update: { isGlobalAdmin: false }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[0]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[0],
      attributes: { ...dummyRootData.auth[0].attributes, isGlobalAdmin: false }
    });

    await expect(
      updateTokensAttributesByAttribute({
        filter: dummyRootData.auth[1].attributes,
        update: { owner: 'name' }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[1]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[1],
      attributes: { ...dummyRootData.auth[1].attributes, owner: 'name' }
    });

    await expect(
      updateTokensAttributesByAttribute({
        filter: { ...dummyRootData.auth[0].attributes, isGlobalAdmin: false },
        update: { owner: 'name', isGlobalAdmin: true }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[0]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[0],
      attributes: {
        ...dummyRootData.auth[0].attributes,
        owner: 'name',
        isGlobalAdmin: true
      }
    });

    await expect(
      updateTokensAttributesByAttribute({
        filter: { ...dummyRootData.auth[1].attributes, owner: 'name' },
        update: { isGlobalAdmin: true }
      })
    ).resolves.toBe(1);

    await expect(
      authDb.findOne({ _id: dummyRootData.auth[1]._id })
    ).resolves.toStrictEqual({
      ...dummyRootData.auth[1],
      attributes: {
        ...dummyRootData.auth[1].attributes,
        owner: 'name',
        isGlobalAdmin: true
      }
    });
  });

  it('updates (patches) multiple existing auth entries', async () => {
    expect.hasAssertions();

    const authDb = await getAuthDb();

    await expect(
      updateTokensAttributesByAttribute({
        filter: {
          owner: dummyRootData.auth
            .slice(0, -1)
            .map((entry) => entry.attributes.owner)
        },
        update: { owner: 'xyz123' }
      })
    ).resolves.toBe(dummyRootData.auth.length - 1);

    await expect(authDb.find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth
        .slice(0, -1)
        .map((entry) => {
          return { ...entry, attributes: { ...entry.attributes, owner: 'xyz123' } };
        })
        .concat(dummyRootData.auth.at(-1)!)
    );

    await expect(
      updateTokensAttributesByAttribute({
        filter: { owner: 'xyz123' },
        update: { isGlobalAdmin: true }
      })
    ).resolves.toBe(
      // ? An extra -1 because one already has isGlobalAdmin === true
      dummyRootData.auth.length - 2
    );

    await expect(authDb.find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth
        .slice(0, -1)
        .map((entry) => {
          return {
            ...entry,
            attributes: {
              ...entry.attributes,
              owner: 'xyz123',
              isGlobalAdmin: true
            } as TokenAttributes
          };
        })
        .concat(dummyRootData.auth.at(-1)!)
    );

    await expect(
      updateTokensAttributesByAttribute({
        filter: {},
        update: { isGlobalAdmin: false }
      })
    ).resolves.toBe(dummyRootData.auth.length);

    await expect(authDb.find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth
        .slice(0, -1)
        .map((entry) => {
          return {
            ...entry,
            attributes: {
              ...entry.attributes,
              owner: 'xyz123',
              isGlobalAdmin: false
            } as TokenAttributes
          };
        })
        .concat({
          ...dummyRootData.auth.at(-1)!,
          attributes: {
            ...dummyRootData.auth.at(-1)!.attributes,
            isGlobalAdmin: false
          }
        })
    );
  });

  it('allows empty update (no-op)', async () => {
    expect.hasAssertions();

    await expect(
      updateTokensAttributesByAttribute({
        filter: dummyRootData.auth[0].attributes,
        update: {}
      })
    ).resolves.toBe(0);

    await expect((await getAuthDb()).find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth
    );
  });

  it('allows empty filter (updates all entries)', async () => {
    expect.hasAssertions();

    await expect(
      updateTokensAttributesByAttribute({
        filter: {},
        update: { owner: 'xyz123' }
      })
    ).resolves.toBe(dummyRootData.auth.length);

    await expect((await getAuthDb()).find().toArray()).resolves.toStrictEqual(
      dummyRootData.auth.map((entry) => {
        return { ...entry, attributes: { ...entry.attributes, owner: 'xyz123' } };
      })
    );
  });

  it('returns 0 updated count when demonstrating idempotency', async () => {
    expect.hasAssertions();

    await expect(
      updateTokensAttributesByAttribute({
        filter: dummyRootData.auth[0].attributes,
        update: dummyRootData.auth[0].attributes
      })
    ).resolves.toBe(0);
  });

  it('returns 0 updated count if the auth entry is not found', async () => {
    expect.hasAssertions();

    await expect(
      updateTokensAttributesByAttribute({
        filter: { owner: 'does-not-exist' },
        update: { isGlobalAdmin: false }
      })
    ).resolves.toBe(0);
  });

  it('rejects if passed invalid data', async () => {
    expect.hasAssertions();

    const errors: [
      params: Parameters<typeof updateTokensAttributesByAttribute>[0],
      error: string
    ][] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [{} as any, ErrorMessage.InvalidSecret('filter')],
      [{ filter: undefined, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: undefined }, ErrorMessage.InvalidSecret('update')],
      [{ filter: null, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: null }, ErrorMessage.InvalidSecret('update')],
      [{ filter: false, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: false }, ErrorMessage.InvalidSecret('update')],
      [{ filter: true, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: true }, ErrorMessage.InvalidSecret('update')],
      [{ filter: { owner: '' }, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: { owner: '' } }, ErrorMessage.InvalidSecret('update')],
      [
        { filter: { isGlobalAdmin: 5 }, update: {} },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: {}, update: { isGlobalAdmin: 5 } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        { filter: { owners: ['prop'] }, update: {} },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: {}, update: { owners: ['prop'] } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        { filter: {}, update: { owner: ['array-form-is-only-for-filter'] } },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          filter: { isGlobalAdmin: null },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: { isGlobalAdmin: null }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          filter: { isGlobalAdmin: 1 },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: { isGlobalAdmin: 1 }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        { filter: { name: 'owner' }, update: {} },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        { filter: {}, update: { name: 'owner' } },
        ErrorMessage.InvalidSecret('update')
      ],
      [{ filter: { owner: null }, update: {} }, ErrorMessage.InvalidSecret('filter')],
      [{ filter: {}, update: { owner: null } }, ErrorMessage.InvalidSecret('update')],
      [
        {
          filter: {
            owner: 'name',
            isGlobalAdmin: 1
          },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: {
            owner: 'name',
            isGlobalAdmin: 1
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          filter: {
            owner: 'name',
            isGlobalAdmin: null
          },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: {
            owner: 'name',
            isGlobalAdmin: null
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          filter: {
            owner: 'name',
            isGlobalAdmin: 'true'
          },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: {
            owner: 'name',
            isGlobalAdmin: 'true'
          }
        },
        ErrorMessage.InvalidSecret('update')
      ],
      [
        {
          filter: {
            owner: 'name',
            extra: 1
          },
          update: {}
        },
        ErrorMessage.InvalidSecret('filter')
      ],
      [
        {
          filter: {},
          update: {
            owner: 'name',
            extra: 1
          }
        },
        ErrorMessage.InvalidSecret('update')
      ]
    ];

    await expectExceptionsWithMatchingErrors(errors, (params) =>
      updateTokensAttributesByAttribute(params)
    );
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      updateTokensAttributesByAttribute({
        filter: dummyRootData.auth[0].attributes,
        update: { owner: 'xyz123' }
      })
    ).resolves.toBe(1);

    await (await getAuthDb()).updateMany({}, { $set: { deleted: true } });

    await expect(
      updateTokensAttributesByAttribute({
        filter: { ...dummyRootData.auth[0].attributes, owner: 'xyz123' },
        update: { owner: 'abc987' }
      })
    ).resolves.toBe(0);

    await expect(
      updateTokensAttributesByAttribute({
        filter: {},
        update: { owner: 'abc987' }
      })
    ).resolves.toBe(0);
  });
});
