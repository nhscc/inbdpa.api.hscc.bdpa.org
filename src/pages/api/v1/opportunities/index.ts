import { withMiddleware } from 'universe/backend/middleware';
import { getAllOpportunities, createOpportunity } from 'universe/backend';
import { authorizationHeaderToOwnerAttribute } from 'universe/backend/api';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/opportunities'
};

export default withMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          opportunities: await getAllOpportunities({
            after_id: req.query.after?.toString(),
            updatedAfter: req.query.updatedAfter?.toString(),
            includeSessionCount: false
          })
        });
        break;
      }

      case 'POST': {
        sendHttpOk(res, {
          opportunity: await createOpportunity({
            data: req.body,
            __provenance: await authorizationHeaderToOwnerAttribute(
              req.headers.authorization
            )
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET', 'POST'], apiVersion: '1' }
  }
);
