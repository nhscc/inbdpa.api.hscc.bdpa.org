import { withMiddleware } from 'universe/backend/middleware';
import { createSession, getPageSessionsCount } from 'universe/backend';
import { authorizationHeaderToOwnerAttribute } from 'universe/backend/api';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/blogs/:blogName/pages/:pageName/sessions'
};

export default withMiddleware(
  async (req, res) => {
    const blogName = req.query.blogName?.toString();
    const pageName = req.query.pageName?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          active: await getPageSessionsCount({ blogName, pageName })
        });
        break;
      }

      case 'POST': {
        const session_id = await createSession({
          blogName,
          pageName,
          __provenance: await authorizationHeaderToOwnerAttribute(
            req.headers.authorization
          )
        });

        sendHttpOk(res, { session_id });
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: {
      allowedContentTypes: ['application/json', 'none'],
      allowedMethods: ['GET', 'POST'],
      apiVersion: '1'
    }
  }
);
