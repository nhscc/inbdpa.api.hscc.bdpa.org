/* eslint-disable @typescript-eslint/no-explicit-any */
import { testApiHandler } from 'next-test-api-route-handler';
import { api, setupMockBackend } from 'testverse/util';

jest.mock('universe/backend');
jest.mock('universe/backend/api', (): typeof import('universe/backend/api') => {
  return {
    ...jest.requireActual('universe/backend/api'),
    authorizationHeaderToOwnerAttribute: jest.fn(() => Promise.resolve('mock-owner'))
  };
});

jest.mock(
  'universe/backend/middleware',
  (): typeof import('universe/backend/middleware') => {
    const { middlewareFactory } = require('multiverse/next-api-glue');
    const { default: handleError } = require('multiverse/next-adhesive/handle-error');

    return {
      withMiddleware: jest
        .fn()
        .mockImplementation(middlewareFactory({ use: [], useOnError: [handleError] }))
    } as unknown as typeof import('universe/backend/middleware');
  }
);

const { mockedAuthAppUser } = setupMockBackend();

describe('api/v1/users', () => {
  describe('/ [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.users,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.users).toBeArray();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/ [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.users,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:username [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id [PATCH]', () => {
    it('accepts PATCH requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'PATCH' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id [DELETE]', () => {
    it('accepts DELETE requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'DELETE' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/auth [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameoridAuth,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(403);
          expect(json.success).toBeFalse();
          expect(json.error).toBeString();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });

      mockedAuthAppUser.mockReturnValue(Promise.resolve(true));

      await testApiHandler({
        handler: api.v1.usersUsernameoridAuth,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/connections [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameoridConnections,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.connections).toBeArray();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id/connections/:connection_id [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameoridConnectionsConnectionid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/connections/:connection_id [DELETE]', () => {
    it('accepts DELETE requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.usersUsernameoridConnectionsConnectionid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'DELETE' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });
});

describe('api/v2/users', () => {
  describe('/ [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.users,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.users).toBeArray();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/ [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.users,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:username [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.user).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id [PATCH]', () => {
    it('accepts PATCH requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'PATCH' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id [DELETE]', () => {
    it('accepts DELETE requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameorid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'DELETE' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/auth [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameoridAuth,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(403);
          expect(json.success).toBeFalse();
          expect(json.error).toBeString();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });

      mockedAuthAppUser.mockReturnValue(Promise.resolve(true));

      await testApiHandler({
        handler: api.v2.usersUsernameoridAuth,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/connections [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameoridConnections,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.connections).toBeArray();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });

  describe('/:user_id/connections/:connection_id [POST]', () => {
    it('accepts POST requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameoridConnectionsConnectionid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'POST' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/connections/:connection_id [DELETE]', () => {
    it('accepts DELETE requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameoridConnectionsConnectionid,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'DELETE' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(Object.keys(json)).toHaveLength(1);
        }
      });
    });
  });

  describe('/:user_id/sessions [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.usersUsernameoridSessions,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.sessions).toBeArray();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });
});
