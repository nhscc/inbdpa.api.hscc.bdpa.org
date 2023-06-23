/* eslint-disable unicorn/filename-case */
import { withSysMiddleware } from 'universe/backend/middleware';
import { sendHttpOk } from 'multiverse/next-api-respond';
import { validateAndParseJson } from 'multiverse/next-api-util';

import {
  getTokensByAttribute,
  updateTokensAttributesByAttribute,
  deleteTokensByAttribute
} from 'multiverse/next-auth';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    const filter = validateAndParseJson(req.query.filter?.toString(), 'filter');

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          fullTokens: await getTokensByAttribute({
            filter,
            after_id: req.query.after?.toString()
          })
        });
        break;
      }

      case 'PATCH': {
        sendHttpOk(res, {
          updated: await updateTokensAttributesByAttribute({
            filter,
            update: req.body?.attributes
          })
        });
        break;
      }

      case 'DELETE': {
        sendHttpOk(res, { deleted: await deleteTokensByAttribute({ filter }) });
        break;
      }
    }
  },
  {
    descriptor: '/sys/auth/search',
    options: { allowedMethods: ['GET', 'PATCH', 'DELETE'] }
  }
);
