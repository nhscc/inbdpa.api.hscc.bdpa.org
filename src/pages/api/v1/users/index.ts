import { withMiddleware } from 'universe/backend/middleware';
import { createUser, getAllUsers } from 'universe/backend';
import { authorizationHeaderToOwnerAttribute } from 'universe/backend/api';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/users'
};

export default withMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          users: await getAllUsers({
            apiVersion: 1,
            after_id: req.query.after?.toString(),
            updatedAfter: req.query.updatedAfter?.toString()
          })
        });
        break;
      }

      case 'POST': {
        sendHttpOk(res, {
          user: await createUser({
            apiVersion: 1,
            data: req.body,
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
    options: { allowedMethods: ['GET', 'POST'], apiVersion: '1' }
  }
);
