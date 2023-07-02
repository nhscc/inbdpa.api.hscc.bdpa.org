import { withMiddleware } from 'universe/backend/middleware';
import { getSessionsFor } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/articles/:article_id/sessions'
};

export default withMiddleware(
  async (req, res) => {
    const article_id = req.query.article_id?.toString();
    const after_id = req.query.after?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          sessions: await getSessionsFor('article', {
            viewed_id: article_id,
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
