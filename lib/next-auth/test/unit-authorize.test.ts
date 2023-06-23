import { useMockDateNow } from 'multiverse/mongo-common';
import { setupMemoryServerOverride } from 'multiverse/mongo-test';

import {
  authorizeHeader,
  type AuthorizationConstraint
} from 'multiverse/next-auth/authorize';

import {
  BANNED_BEARER_TOKEN,
  DEV_BEARER_TOKEN,
  DUMMY_BEARER_TOKEN,
  NULL_BEARER_TOKEN
} from 'multiverse/next-auth/constants';

import { deleteTokenById, getTokenByDerivation } from 'multiverse/next-auth/token';

setupMemoryServerOverride();
useMockDateNow();

describe('::authorizeHeader', () => {
  it('returns a vacuously authorized response if bearer token exists in database', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${DUMMY_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authorized: true });

    await expect(
      authorizeHeader({
        header: `BEARER ${DEV_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authorized: true });
  });

  // ? Rejecting banned tokens is handled at a different layer than authorization
  it('returns a vacuously authorized response even if bearer token is banned', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authorized: true });
  });

  it('returns a vacuously authorized response if passed no constraints', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`,
        constraints: []
      })
    ).resolves.toStrictEqual({ authorized: true });
  });

  it('returns an authorized response if authorization succeeds', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${DEV_BEARER_TOKEN}`,
        constraints: ['isGlobalAdmin']
      })
    ).resolves.toStrictEqual({ authorized: true });
  });

  it('returns a not-authorized response if bearer token does not exist in database', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${NULL_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({ authorized: false });
  });

  it('returns a not-authorized response only if the isGlobalAdmin constraint fails', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`,
        constraints: 'isGlobalAdmin'
      })
    ).resolves.toStrictEqual({ authorized: false });

    await expect(
      authorizeHeader({
        header: `bearer ${DEV_BEARER_TOKEN}`,
        constraints: 'isGlobalAdmin'
      })
    ).resolves.toStrictEqual({
      authorized: true
    });
  });

  it('rejects if duplicate constraints provided', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`,
        constraints: ['isGlobalAdmin', 'isGlobalAdmin']
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        'encountered duplicate authorization constraints'
      )
    });
  });

  it('rejects if a non-existent constraint is provided', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${BANNED_BEARER_TOKEN}`,
        constraints: ['fake-constraint' as AuthorizationConstraint]
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        'encountered unknown or unhandled authorization constraint "fake-constraint"'
      )
    });
  });

  it('ignores deleted auth entries', async () => {
    expect.hasAssertions();

    await expect(
      authorizeHeader({
        header: `bearer ${DEV_BEARER_TOKEN}`,
        constraints: ['isGlobalAdmin']
      })
    ).resolves.toStrictEqual({ authorized: true });

    await expect(
      deleteTokenById({
        auth_id: (
          await getTokenByDerivation({ from: `bearer ${DEV_BEARER_TOKEN}` })
        ).auth_id
      })
    ).resolves.toBe(1);

    await expect(
      authorizeHeader({
        header: `bearer ${DEV_BEARER_TOKEN}`
      })
    ).resolves.toStrictEqual({
      authorized: false
    });
  });
});
