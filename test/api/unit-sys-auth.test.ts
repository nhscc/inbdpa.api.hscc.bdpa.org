/* eslint-disable no-global-assign */
import { randomUUID } from 'node:crypto';
import { testApiHandler } from 'next-test-api-route-handler';
import { ObjectId, type Collection, type Db } from 'mongodb';

import { setupMemoryServerOverride } from 'multiverse/mongo-test';
import { useMockDateNow } from 'multiverse/jest-mock-date';
import { getDb } from 'multiverse/mongo-schema';
import { dummyRootData } from 'multiverse/mongo-common';

import {
  BANNED_BEARER_TOKEN,
  DEV_BEARER_TOKEN,
  DUMMY_BEARER_TOKEN,
  toPublicAuthEntry,
  type PublicAuthEntry,
  type InternalAuthBearerEntry
} from 'multiverse/next-auth';

import AuthEndpoint, {
  config as AuthConfig
} from 'universe/pages/api/sys/auth/index';

import AuthAuthIdEndpoint, {
  config as AuthAuthIdConfig
} from 'universe/pages/api/sys/auth/[auth_id]';

import AuthSearchEndpoint, {
  config as AuthSearchConfig
} from 'universe/pages/api/sys/auth/search';

import type { NextApiHandlerMixin } from 'testverse/util';
import type { InternalLimitedLogEntry } from 'multiverse/next-limit';

setupMemoryServerOverride();
useMockDateNow();

// * This suite blurs the line between unit and integration tests for portability
// * reasons.
// TODO: replace with next-fable (formerly / in addition to: @xunnamius/fable).
// TODO: Also, split out into proper unit vs integration tests when in package
// TODO: form.

const authHandler = AuthEndpoint as NextApiHandlerMixin;
const authAuthIdHandler = AuthAuthIdEndpoint as NextApiHandlerMixin;
const authSearchHandler = AuthSearchEndpoint as NextApiHandlerMixin;

authHandler.config = AuthConfig;
authAuthIdHandler.config = AuthAuthIdConfig;
authSearchHandler.config = AuthSearchConfig;

describe('middleware correctness tests', () => {
  it('endpoints fail on req with bad authentication', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: authHandler,
      test: async ({ fetch }) => {
        await expect(fetch().then((r) => r.status)).resolves.toBe(401);
      }
    });

    await testApiHandler({
      handler: authAuthIdHandler,
      params: { auth_id: new ObjectId().toString() },
      test: async ({ fetch }) => {
        await expect(fetch().then((r) => r.status)).resolves.toBe(401);
      }
    });

    await testApiHandler({
      handler: authSearchHandler,
      test: async ({ fetch }) => {
        await expect(fetch().then((r) => r.status)).resolves.toBe(401);
      }
    });
  });

  it('endpoints fail if authenticated req is not authorized', async () => {
    expect.hasAssertions();

    await testApiHandler({
      handler: authHandler,
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${DUMMY_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(403);
      }
    });

    await testApiHandler({
      handler: authAuthIdHandler,
      params: { auth_id: new ObjectId().toString() },
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${DUMMY_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(403);
      }
    });

    await testApiHandler({
      handler: authSearchHandler,
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${DUMMY_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(403);
      }
    });
  });

  it('endpoints fail if authed req is rate limited', async () => {
    expect.hasAssertions();

    await (await getDb({ name: 'root' }))
      .collection<InternalAuthBearerEntry>('auth')
      .updateOne(
        { token: { bearer: BANNED_BEARER_TOKEN } },
        { $set: { 'attributes.isGlobalAdmin': true } }
      );

    await testApiHandler({
      handler: authHandler,
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${BANNED_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(429);
      }
    });

    await testApiHandler({
      handler: authAuthIdHandler,
      params: { auth_id: new ObjectId().toString() },
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${BANNED_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(429);
      }
    });

    await testApiHandler({
      handler: authSearchHandler,
      test: async ({ fetch }) => {
        await expect(
          fetch({
            headers: { Authorization: `bearer ${BANNED_BEARER_TOKEN}` }
          }).then((r) => r.status)
        ).resolves.toBe(429);
      }
    });
  });
});

describe('api/sys/auth', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});

describe('api/sys/auth/:auth_id', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});

describe('api/sys/auth/search', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});
