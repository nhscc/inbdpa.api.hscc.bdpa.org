import { withMiddleware } from 'universe/backend/middleware';
import { authAppUser } from 'universe/backend';
import { sendHttpOk, sendHttpUnauthorized } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:user_id/auth'
};

export default withMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'POST': {
        const authSucceeded = await authAppUser({
          user_id: req.query.usernameOrId?.toString(),
          key: req.body?.key
        });

        if (authSucceeded) {
          sendHttpOk(res);
        } else {
          sendHttpUnauthorized(res);
        }
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['POST'], apiVersion: '1' }
  }
);
