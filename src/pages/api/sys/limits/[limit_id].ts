/* eslint-disable unicorn/filename-case */
import { sendHttpOk } from 'multiverse/next-api-respond';
import { getRateLimit, deleteRateLimit } from 'multiverse/next-limit';
import { withSysMiddleware } from 'universe/backend/middleware';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          limit: await getRateLimit({ limitId: req.query.limitId?.toString() })
        });
        break;
      }

      case 'DELETE': {
        await deleteRateLimit({ limitId: req.query.limitId?.toString() });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: '/sys/limits/:limit_id',
    options: { allowedMethods: ['GET', 'DELETE'] }
  }
);
