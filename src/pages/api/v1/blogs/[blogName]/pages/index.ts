import { withMiddleware } from 'universe/backend/middleware';
import { createPage, getBlogPagesMetadata } from 'universe/backend';
import { authorizationHeaderToOwnerAttribute } from 'universe/backend/api';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/blogs/:blogName/pages'
};

export default withMiddleware(
  async (req, res) => {
    const blogName = req.query.blogName?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          pages: await getBlogPagesMetadata({ blogName })
        });
        break;
      }

      case 'POST': {
        sendHttpOk(res, {
          page: await createPage({
            blogName,
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
