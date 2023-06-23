/* eslint-disable unicorn/filename-case */
import { withSysMiddleware } from 'universe/backend/middleware';
import { sendHttpOk } from 'multiverse/next-api-respond';

import {
  getTokenById,
  updateTokenAttributesById,
  deleteTokenById
} from 'multiverse/next-auth';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          fullToken: await getTokenById({ auth_id: req.query.auth_id?.toString() })
        });
        break;
      }

      case 'PATCH': {
        sendHttpOk(res, {
          updated: await updateTokenAttributesById({
            auth_id: req.query.auth_id?.toString(),
            update: req.body?.attributes
          })
        });
        break;
      }

      case 'DELETE': {
        sendHttpOk(res, {
          deleted: await deleteTokenById({ auth_id: req.query.auth_id?.toString() })
        });
        break;
      }
    }
  },
  {
    descriptor: '/sys/auth/:auth_id',
    options: { allowedMethods: ['GET', 'PATCH', 'DELETE'] }
  }
);
