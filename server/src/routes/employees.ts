import type { FastifyInstance, FastifyReply } from 'fastify';
import type { ZodError } from 'zod';
import { CreateEmployeeSchema } from '@salary/shared';
import type { EmployeeService } from '../services/employee-service';

const sendValidationError = (reply: FastifyReply, error: ZodError) =>
  reply.code(400).send({
    error: 'ValidationError',
    issues: error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
    })),
  });

export const employeeRoutes = (service: EmployeeService) => async (app: FastifyInstance) => {
  app.post('/employees', async (request, reply) => {
    const parsed = CreateEmployeeSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }
    const employee = await service.create(parsed.data);
    return reply.code(201).send(employee);
  });
};
