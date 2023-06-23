/* eslint-disable unicorn/filename-case */
import { sendHttpOk } from 'multiverse/next-api-respond';
import { validateAndParseJson } from 'multiverse/next-api-util';
import { withSysMiddleware } from 'universe/backend/middleware';

import { getFilteredLogs, deleteFilteredLogs } from 'multiverse/next-log';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    const filter = validateAndParseJson(req.query.filter?.toString(), 'filter');

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          logs: await getFilteredLogs({
            filter,
            after_id: req.query.after?.toString()
          })
        });
        break;
      }

      case 'DELETE': {
        sendHttpOk(res, { deleted: await deleteFilteredLogs({ filter }) });
        break;
      }
    }
  },
  {
    descriptor: '/sys/logs/search',
    options: { allowedMethods: ['GET', 'DELETE'] }
  }
);
