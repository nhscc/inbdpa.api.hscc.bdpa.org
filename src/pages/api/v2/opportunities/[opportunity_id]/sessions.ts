import { withMiddleware } from 'universe/backend/middleware';
import { getSessionsFor } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/opportunities/:opportunity_id/sessions'
};

export default withMiddleware(
  async (req, res) => {
    const opportunity_id = req.query.opportunity_id?.toString();
    const after_id = req.query.after?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          sessions: await getSessionsFor('opportunity', {
            viewed_id: opportunity_id,
            after_id
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET'], apiVersion: '2' }
  }
);
