import { withMiddleware } from 'universe/backend/middleware';
import { getUser, updateUser, deleteUser } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:(user_id|username)'
};

export default withMiddleware(
  async (req, res) => {
    const usernameOrId = req.query.usernameOrId?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          user: await getUser({
            apiVersion: 1,
            usernameOrId
          })
        });
        break;
      }

      case 'PATCH': {
        await updateUser({
          apiVersion: 1,
          user_id: usernameOrId,
          data: req.body
        });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteUser({ user_id: usernameOrId });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET', 'PATCH', 'DELETE'], apiVersion: '1' }
  }
);
