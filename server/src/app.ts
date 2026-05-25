import Fastify, { type FastifyInstance } from 'fastify';
import type { EmployeeService } from './services/employee-service';
import { employeeRoutes } from './routes/employees';

/**
 * Build a Fastify instance wired to a given EmployeeService. Tests
 * construct one of these with an in-memory service and call .inject()
 * directly — no port binding, no http roundtrips, fully deterministic.
 */
export const buildApp = (service: EmployeeService): FastifyInstance => {
  const app = Fastify({ logger: false });
  app.register(employeeRoutes(service));
  return app;
};
