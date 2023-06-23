import { withSysMiddleware } from 'universe/backend/middleware';
import { sendHttpOk } from 'multiverse/next-api-respond';
import { getTokensByAttribute, createToken } from 'multiverse/next-auth';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          fullTokens: await getTokensByAttribute({
            filter: {},
            after_id: req.query.after?.toString()
          })
        });
        break;
      }

      case 'POST': {
        sendHttpOk(res, { fullToken: await createToken({ data: req.body }) });
        break;
      }
    }
  },
  {
    descriptor: '/sys/auth',
    options: { allowedMethods: ['GET', 'POST'] }
  }
);
