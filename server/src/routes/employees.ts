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

const notFound = (reply: FastifyReply, id: string) =>
  reply.code(404).send({ error: 'NotFound', message: `employee ${id} not found` });

export const employeeRoutes = (service: EmployeeService) => async (app: FastifyInstance) => {
  app.post('/employees', async (request, reply) => {
    const parsed = CreateEmployeeSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }
    const employee = await service.create(parsed.data);
    return reply.code(201).send(employee);
  });

  app.get<{ Params: { id: string } }>('/employees/:id', async (request, reply) => {
    const { id } = request.params;
    const employee = await service.findById(id);
    if (!employee) {
      return notFound(reply, id);
    }
    return employee;
  });
};
