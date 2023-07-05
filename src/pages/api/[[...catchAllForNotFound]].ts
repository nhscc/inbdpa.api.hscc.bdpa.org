/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { sendHttpNotFound } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: 'catch-all-for-not-found'
};

const descriptorPrefix = '404:';

export default withMiddleware(async (_req, res) => sendHttpNotFound(res), {
  prependUse: [
    (req, _res, context) => {
      context.runtime.endpoint.descriptor = `${descriptorPrefix}/${
        [req.query.catchAllForNotFound].flat().join('/') || '/'
      }`;
    }
  ],
  descriptor: descriptorPrefix,
  options: {
    allowedMethods: [
      'CONNECT',
      'DELETE',
      'GET',
      'HEAD',
      'OPTIONS',
      'PATCH',
      'POST',
      'PUT',
      'TRACE'
    ]
  }
});
