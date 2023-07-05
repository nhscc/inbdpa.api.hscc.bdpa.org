/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { createSession } from 'universe/backend';
import { authorizationHeaderToOwnerAttribute } from 'universe/backend/api';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/sessions'
};

export default withMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'POST': {
        sendHttpOk(res, {
          session_id: await createSession({
            data: req.body,
            apiVersion: 1,
            __provenance: await authorizationHeaderToOwnerAttribute(
              req.headers.authorization
            )
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['POST'], apiVersion: '1' }
  }
);
