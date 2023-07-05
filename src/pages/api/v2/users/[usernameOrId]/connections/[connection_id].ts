/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { createUserConnection, deleteUserConnection } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:user_id/connections/:connection_id'
};

export default withMiddleware(
  async (req, res) => {
    const usernameOrId = req.query.usernameOrId?.toString();
    const connection_id = req.query.connection_id?.toString();

    switch (req.method) {
      case 'POST': {
        await createUserConnection({ user_id: usernameOrId, connection_id });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteUserConnection({ user_id: usernameOrId, connection_id });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: {
      allowedMethods: ['POST', 'DELETE'],
      apiVersion: '2',
      allowedContentTypes: { POST: ['application/json', 'none'], DELETE: 'none' }
    }
  }
);
