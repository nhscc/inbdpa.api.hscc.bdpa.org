import { withMiddleware } from 'universe/backend/middleware';
import { authAppUser } from 'universe/backend';
import { sendHttpOk, sendHttpUnauthorized } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:usernameOrEmail/auth'
};

export default withMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'POST': {
        const authSucceeded = await authAppUser({
          usernameOrEmail: req.query.usernameOrEmail?.toString(),
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
