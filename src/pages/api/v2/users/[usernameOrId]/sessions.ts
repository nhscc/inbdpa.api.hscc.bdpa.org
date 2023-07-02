import { withMiddleware } from 'universe/backend/middleware';
import { getSessionsFor } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:user_id/sessions'
};

export default withMiddleware(
  async (req, res) => {
    const user_id = req.query.usernameOrId?.toString();
    const after_id = req.query.after?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          sessions: await getSessionsFor('profile', { viewed_id: user_id, after_id })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET'], apiVersion: '2' }
  }
);
