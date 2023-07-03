import { withMiddleware } from 'universe/backend/middleware';
import { getUserConnections } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:user_id/connections'
};

export default withMiddleware(
  async (req, res) => {
    const usernameOrId = req.query.usernameOrId?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          connections: await getUserConnections({
            user_id: usernameOrId,
            after_id: req.query.after?.toString()
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET'], apiVersion: '1' }
  }
);
