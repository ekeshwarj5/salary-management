import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import type { EmployeeService } from './services/employee-service';
import type { InsightsService } from './services/insights-service';
import { employeeRoutes } from './routes/employees';
import { insightsRoutes } from './routes/insights';

export interface AppServices {
  employees: EmployeeService;
  insights: InsightsService;
}

export interface AppOptions {
  logger?: boolean;
  /** Permitted client origins for CORS. Defaults to `true` (reflect any). */
  corsOrigin?: boolean | string | string[];
}

/**
 * Build a Fastify instance wired to a given set of services. Tests
 * construct one with in-memory services and call .inject() directly —
 * no port binding, no http roundtrips, fully deterministic.
 */
export const buildApp = (
  services: AppServices,
  options: AppOptions = {},
): FastifyInstance => {
  const app = Fastify({ logger: options.logger ?? false });
  app.register(cors, { origin: options.corsOrigin ?? true });
  app.register(employeeRoutes(services.employees));
  app.register(insightsRoutes(services.insights));
  return app;
};
