// TODO
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

describe('api/sys/logs', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});

describe('api/sys/logs/:log_id', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});

describe('api/sys/logs/search', () => {
  describe('/ [GET]', () => {
    it('todo', async () => {
      expect.hasAssertions();
    });
  });
});
