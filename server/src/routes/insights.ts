import type { FastifyInstance, FastifyReply } from 'fastify';
import { z, type ZodError } from 'zod';
import type { InsightsService } from '../services/insights-service';

const sendValidationError = (reply: FastifyReply, error: ZodError) =>
  reply.code(400).send({
    error: 'ValidationError',
    issues: error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
    })),
  });

const ByTitleQuerySchema = z.object({
  country: z
    .string()
    .regex(/^[A-Z]{2}$/, { message: 'country must be a two-letter uppercase code' }),
});

export const insightsRoutes = (service: InsightsService) => async (app: FastifyInstance) => {
  app.get('/insights/by-country', async () => service.getByCountry());

  app.get('/insights/by-title', async (request, reply) => {
    const parsed = ByTitleQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }
    return service.getByTitleInCountry(parsed.data.country);
  });

  app.get('/insights/overview', async () => service.getOverview());
};
