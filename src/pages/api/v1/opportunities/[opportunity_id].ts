/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { sendHttpOk } from 'multiverse/next-api-respond';

import {
  getOpportunity,
  updateOpportunity,
  deleteOpportunity
} from 'universe/backend';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/opportunities/:opportunity_id'
};

export default withMiddleware(
  async (req, res) => {
    const opportunity_id = req.query.opportunity_id?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          opportunity: await getOpportunity({
            apiVersion: 1,
            opportunity_id
          })
        });
        break;
      }

      case 'PATCH': {
        await updateOpportunity({
          opportunity_id,
          data: req.body
        });

        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteOpportunity({ opportunity_id });
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
