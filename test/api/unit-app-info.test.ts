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

setupMockBackend();

describe('api/v1/info', () => {
  describe('/ [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v1.info,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.info).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });
});

describe('api/v2/info', () => {
  describe('/ [GET]', () => {
    it('accepts GET requests', async () => {
      expect.hasAssertions();

      await testApiHandler({
        handler: api.v2.info,
        test: async ({ fetch }) => {
          const [status, json] = await fetch({ method: 'GET' }).then(
            async (r) => [r.status, await r.json()] as [status: number, json: any]
          );

          expect(status).toBe(200);
          expect(json.success).toBeTrue();
          expect(json.info).toBeObject();
          expect(Object.keys(json)).toHaveLength(2);
        }
      });
    });
  });
});
