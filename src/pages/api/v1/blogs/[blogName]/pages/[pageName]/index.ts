import { withMiddleware } from 'universe/backend/middleware';
import { getPage, updatePage, deletePage } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/blogs/:blogName/pages/:pageName'
};

export default withMiddleware(
  async (req, res) => {
    const blogName = req.query.blogName?.toString();
    const pageName = req.query.pageName?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, { page: await getPage({ blogName, pageName }) });
        break;
      }

      case 'PATCH': {
        await updatePage({ blogName, pageName, data: req.body });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deletePage({ blogName, pageName });
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
