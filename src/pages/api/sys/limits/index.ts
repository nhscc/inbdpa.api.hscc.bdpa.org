import { sendHttpOk } from 'multiverse/next-api-respond';
import { getAllRateLimits, createRateLimit } from 'multiverse/next-limit';
import { withSysMiddleware } from 'universe/backend/middleware';

// ? https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export { defaultConfig as config } from 'universe/backend/api';

export default withSysMiddleware(
  async (req, res) => {
    switch (req.method) {
      case 'GET': {
        sendHttpOk(res, {
          limits: await getAllRateLimits({ after_id: req.query.after?.toString() })
        });
        break;
      }

      case 'POST': {
        sendHttpOk(res, { limit: await createRateLimit({ data: req.body }) });
        break;
      }
    }
  },
  {
    descriptor: '/sys/limits',
    options: { allowedMethods: ['GET', 'POST'] }
  }
);
