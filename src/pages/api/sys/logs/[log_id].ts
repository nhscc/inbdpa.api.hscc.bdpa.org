/* eslint-disable unicorn/filename-case */
import { sendHttpOk } from 'multiverse/next-api-respond';
import { getLog, deleteLog } from 'multiverse/next-log';
import { withSysMiddleware } from 'universe/backend/middleware';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          log: await getLog({ logId: req.query.logId?.toString() })
        });
        break;
      }

      case 'DELETE': {
        await deleteLog({ logId: req.query.logId?.toString() });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: '/sys/logs/:log_id',
    options: { allowedMethods: ['GET', 'DELETE'] }
  }
);
