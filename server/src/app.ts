import Fastify, { type FastifyInstance } from 'fastify';
import type { EmployeeService } from './services/employee-service';
import type { InsightsService } from './services/insights-service';
import { employeeRoutes } from './routes/employees';
import { insightsRoutes } from './routes/insights';

export interface AppServices {
  employees: EmployeeService;
  insights: InsightsService;
}

/**
 * Build a Fastify instance wired to a given set of services. Tests
 * construct one of these with in-memory services and call .inject()
 * directly — no port binding, no http roundtrips, fully deterministic.
 */
export const buildApp = ({ employees, insights }: AppServices): FastifyInstance => {
  const app = Fastify({ logger: false });
  app.register(employeeRoutes(employees));
  app.register(insightsRoutes(insights));
  return app;
};
