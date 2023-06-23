import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { asMockedFunction } from '@xunnamius/jest-types';

import { useMockDateNow } from 'multiverse/mongo-common';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';

import * as NextAuthTokenSpyTarget from 'multiverse/next-auth/token';

import {
  DUMMY_BEARER_TOKEN,
  authenticateHeader,
  authorizeHeader,
  createToken,
  deriveSchemeAndToken,
  getAuthDb,
  validAuthenticationSchemes,
  type AuthenticationScheme,
  type TokenAttributes,
  type InternalAuthEntry,
  type Token
} from 'multiverse/next-auth';

setupMemoryServerOverride();
useMockDateNow();

jest.mock('node:crypto');

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

test('ensure multiple different auth entries of various schemes can coexist', async () => {
  expect.hasAssertions();

  mockRandomUUID.mockImplementation(jest.requireActual('node:crypto').randomUUID);

  const uuid = randomUUID();
  const authDb = await getAuthDb();

  mutableAuthenticationSchemes.push('new-scheme-1', 'new-scheme-2');

  const newEntryRed: InternalAuthEntry = {
    _id: new ObjectId(),
    deleted: false,
    attributes: {
      owner: 'owner-red',
      isGlobalAdmin: false,
      createdAt: Date.now()
    } as TokenAttributes,
    scheme: 'new-scheme-1' as AuthenticationScheme,
    token: { id1: uuid.slice(0, 32), id2: uuid.slice(32) }
  };

  const newEntryBlue: InternalAuthEntry = {
    _id: new ObjectId(),
    deleted: false,
    attributes: { owner: 'owner-blue', isGlobalAdmin: true },
    scheme: 'new-scheme-2' as AuthenticationScheme,
    token: {
      uuid,
      salt: uuid.slice(0, 3),
      granter: { key: `${uuid.slice(0, 3)}-${uuid}` }
    }
  };

  const actual_deriveSchemeAndToken = deriveSchemeAndToken;

  jest
    .spyOn(NextAuthTokenSpyTarget, 'deriveSchemeAndToken')
    .mockImplementation(async function ({
      authString,
      authData
    }: {
      authString?: string;
      authData?: Token;
    }): Promise<Token> {
      let returnValue: Token | undefined;

      if (
        authString?.startsWith('new-scheme-1') ||
        authData?.scheme?.startsWith('new-scheme-1')
      ) {
        returnValue = {
          scheme: 'new-scheme-1' as AuthenticationScheme,
          token: { id1: uuid.slice(0, 32), id2: uuid.slice(32) }
        };
      } else if (
        authString?.startsWith('new-scheme-2') ||
        authData?.scheme?.startsWith('new-scheme-2')
      ) {
        returnValue = {
          scheme: 'new-scheme-2' as AuthenticationScheme,
          token: {
            uuid,
            salt: uuid.slice(0, 3),
            granter: { key: `${uuid.slice(0, 3)}-${uuid}` }
          }
        };
      } else {
        // eslint-disable-next-line prefer-rest-params
        returnValue = await actual_deriveSchemeAndToken(arguments[0]);
      }

      return returnValue;
    } as typeof deriveSchemeAndToken);

  jest.spyOn(NextAuthTokenSpyTarget, 'isTokenAttributes').mockReturnValue(true);

  const newEntry1 = await createToken({
    data: { attributes: { owner: 'owner-1' } }
  });

  const newEntry2 = await createToken({
    data: { attributes: { owner: 'owner-2', isGlobalAdmin: true } }
  });

  // * Pseudo-createToken calls
  await authDb.insertOne(newEntryRed);
  await authDb.insertOne(newEntryBlue);

  await expect(
    authenticateHeader({ header: `${newEntry1.scheme} ${newEntry1.token.bearer}` })
  ).resolves.toStrictEqual({ authenticated: true });

  await expect(
    authenticateHeader({ header: `${newEntry2.scheme} ${newEntry2.token.bearer}` })
  ).resolves.toStrictEqual({ authenticated: true });

  await expect(
    authenticateHeader({ header: `${newEntryRed.scheme} ${newEntryRed.token.id1}` })
  ).resolves.toStrictEqual({ authenticated: true });

  await expect(
    authenticateHeader({
      header: `${newEntryBlue.scheme} ${newEntryBlue.token.uuid}`
    })
  ).resolves.toStrictEqual({ authenticated: true });

  await expect(
    authenticateHeader({ header: `${newEntry1.scheme} ${newEntryBlue.token.uuid}` })
  ).resolves.toStrictEqual({ authenticated: false });

  await expect(
    authorizeHeader({
      header: `${newEntry1.scheme} ${newEntry1.token.bearer}`,
      constraints: 'isGlobalAdmin'
    })
  ).resolves.toStrictEqual({ authorized: false });

  await expect(
    authorizeHeader({
      header: `${newEntry2.scheme} ${newEntry2.token.bearer}`,
      constraints: 'isGlobalAdmin'
    })
  ).resolves.toStrictEqual({ authorized: true });

  await expect(
    authorizeHeader({
      header: `${newEntryRed.scheme} ${newEntryRed.token.id1}`,
      constraints: 'isGlobalAdmin'
    })
  ).resolves.toStrictEqual({ authorized: false });

  await expect(
    authorizeHeader({
      header: `${newEntryBlue.scheme} ${newEntryBlue.token.uuid}`,
      constraints: 'isGlobalAdmin'
    })
  ).resolves.toStrictEqual({ authorized: true });
});
