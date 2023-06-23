import { withMiddleware } from 'universe/backend/middleware';
import { getBlog, updateBlog } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/blogs/:blogName'
};

export default withMiddleware(
  async (req, res) => {
    const blogName = req.query.blogName?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          blog: await getBlog({ blogName })
        });
        break;
      }

      case 'PATCH': {
        sendHttpOk(res, {
          page: await updateBlog({
            blogName,
            data: req.body
          })
        });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: { allowedMethods: ['GET', 'PATCH'], apiVersion: '1' }
  }
);
