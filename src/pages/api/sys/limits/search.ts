/* eslint-disable unicorn/filename-case */
import { sendHttpOk } from 'multiverse/next-api-respond';
import { validateAndParseJson } from 'multiverse/next-api-util';
import { withSysMiddleware } from 'universe/backend/middleware';

import {
  getFilteredRateLimits,
  deleteFilteredRateLimits
} from 'multiverse/next-limit';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    const filter = validateAndParseJson(req.query.filter?.toString(), 'filter');

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          limits: await getFilteredRateLimits({
            filter,
            after_id: req.query.after?.toString()
          })
        });
        break;
      }

      case 'DELETE': {
        sendHttpOk(res, { deleted: await deleteFilteredRateLimits({ filter }) });
        break;
      }
    }
  },
  {
    descriptor: '/sys/limits/search',
    options: { allowedMethods: ['GET', 'DELETE'] }
  }
);
