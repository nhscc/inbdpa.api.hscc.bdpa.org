/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { renewSession, deleteSession } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/blogs/:blogName/pages/:pageName/sessions/:session_id'
};

export default withMiddleware(
  async (req, res) => {
    const session_id = req.query.session_id?.toString();

    switch (req.method) {
      case 'PUT': {
        await renewSession({ sessionId: session_id });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteSession({ sessionId: session_id });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: {
      allowedContentTypes: ['application/json', 'none'],
      allowedMethods: ['PUT', 'DELETE'],
      apiVersion: '1'
    }
  }
);
