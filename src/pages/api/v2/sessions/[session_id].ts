/* eslint-disable unicorn/filename-case */
import { withMiddleware } from 'universe/backend/middleware';
import { getSession, renewSession, deleteSession } from 'universe/backend';
import { sendHttpOk } from 'multiverse/next-api-respond';

// ? This is a NextJS special "config" export
export { defaultConfig as config } from 'universe/backend/api';

export const metadata = {
  descriptor: '/sessions/:session_id'
};

export default withMiddleware(
  async (req, res) => {
    const session_id = req.query.session_id?.toString();

    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, { session: await getSession({ session_id }) });
        break;
      }

      case 'PATCH': {
        await renewSession({ session_id });
        sendHttpOk(res);
        break;
      }

      case 'DELETE': {
        await deleteSession({ session_id });
        sendHttpOk(res);
        break;
      }
    }
  },
  {
    descriptor: metadata.descriptor,
    options: {
      allowedMethods: ['GET', 'PATCH', 'DELETE'],
      apiVersion: '2',
      allowedContentTypes: {
        GET: 'none',
        PATCH: ['application/json', 'none'],
        DELETE: 'none'
      }
    }
  }
);
