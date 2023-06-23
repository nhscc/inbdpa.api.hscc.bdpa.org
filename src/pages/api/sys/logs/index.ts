/* eslint-disable unicorn/filename-case */
import { sendHttpOk } from 'multiverse/next-api-respond';
import { getAllLogs } from 'multiverse/next-log';
import { withSysMiddleware } from 'universe/backend/middleware';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          logs: await getAllLogs({ after_id: req.query.after?.toString() })
        });
        break;
      }
    }
  },
  {
    descriptor: '/sys/logs',
    options: { allowedMethods: ['GET'] }
  }
);
