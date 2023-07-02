import { withMiddleware } from 'universe/backend/middleware';
import { getArticle, updateArticle, deleteArticle } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/articles/:article_id'
};

export default withMiddleware(
  async (req, res) => {
    const article_id = req.query.article_id?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          article: await getArticle({ article_id })
        });
        break;
      }

      case 'PATCH': {
        await updateArticle({ article_id, data: req.body });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteArticle({ article_id });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET', 'PATCH', 'DELETE'], apiVersion: '2' }
  }
);
