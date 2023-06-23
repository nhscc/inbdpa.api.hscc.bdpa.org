import { withMiddleware } from 'universe/backend/middleware';
import { getUser, updateUser, deleteUser } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users/:usernameOrEmail'
};

export default withMiddleware(
  async (req, res) => {
    const usernameOrEmail = req.query.usernameOrEmail?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, { user: await getUser({ usernameOrEmail }) });
        break;
      }

      case 'PATCH': {
        await updateUser({ usernameOrEmail, data: req.body });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteUser({ usernameOrEmail });
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
