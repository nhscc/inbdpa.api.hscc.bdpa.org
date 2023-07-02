import { useMockDateNow } from 'multiverse/mongo-common';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';

import {
  authenticateHeader,
  validAuthenticationSchemes,
  type AuthenticationScheme
} from 'multiverse/next-auth/authenticate';

import {
  BANNED_BEARER_TOKEN,
  DEV_BEARER_TOKEN,
  DUMMY_BEARER_TOKEN,
  NULL_BEARER_TOKEN
} from 'multiverse/next-auth/constants';

import { deleteTokenById, getTokenByDerivation } from 'multiverse/next-auth/token';

setupMemoryServerOverride();
useMockDateNow();

test('ensure validAuthenticationSchemes contains only lowercase alphanumeric strings', () => {
  expect.hasAssertions();
  const isLowercaseAlphanumeric = /^[\da-z]+$/;

  expect(
    validAuthenticationSchemes.every(
      (scheme) => typeof scheme === 'string' && isLowercaseAlphanumeric.test(scheme)
    )
  ).toBeTrue();
});

describe('::authenticateHeader', () => {
  it('returns an authenticated response if bearer token exists in database', async () => {
    expect.hasAssertions();

    await expect(
      authenticateHeader({
        header: `bearer ${DUMMY_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: true });

    await expect(
      authenticateHeader({
        header: `BEARER ${DEV_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: true });
  });

  // ? Rejecting banned tokens is handled at a different layer than validation
  it('returns an authenticated response even if bearer token is banned', async () => {
    expect.hasAssertions();

    await expect(
      authenticateHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: true });
  });

  it('returns a not-authenticated response if bearer token does not exist in database', async () => {
    expect.hasAssertions();

    await expect(
      authenticateHeader({
        header: `bearer ${NULL_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: false });
  });

  it('returns a not-authenticated response if using a disallowed scheme', async () => {
    expect.hasAssertions();

    await expect(
      authenticateHeader({
        header: 'bearer 123',
        allowedSchemes: ['none' as unknown as AuthenticationScheme]
      })
    ).resolves.toStrictEqual({ authenticated: false });
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      authenticateHeader({
        header: `bearer ${DUMMY_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: true });

    await expect(
      deleteTokenById({
        auth_id: (
          await getTokenByDerivation({ from: `bearer ${DUMMY_BEARER_TOKEN}` })
        ).auth_id
      })
    ).resolves.toBe(1);

    await expect(
      authenticateHeader({
        header: `bearer ${DUMMY_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authenticated: false });
  });
});
