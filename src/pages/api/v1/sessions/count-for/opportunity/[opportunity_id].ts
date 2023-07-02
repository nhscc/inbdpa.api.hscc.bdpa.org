/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { sendHttpOk } from 'multiverse/next-api-respond';

import { getSessionsCountFor } from 'universe/backend';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/sessions/count-for/opportunity/:opportunity_id'
};

export default withMiddleware(
  async (req, res) => {
    const opportunity_id = req.query.opportunity_id?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          active: await getSessionsCountFor('opportunity', {
            viewed_id: opportunity_id
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET'], apiVersion: '1' }
  }
);
