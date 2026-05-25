import type { FastifyInstance, FastifyReply } from 'fastify';
import { z, type ZodError } from 'zod';
import { CreateEmployeeSchema, UpdateEmployeeSchema } from '@salary/shared';
import type { EmployeeService } from '../services/employee-service';

// Query parameters arrive as strings; coerce numerics and validate
// formats up front so the service receives well-typed input.
const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/, { message: 'country must be a two-letter uppercase code' })
    .optional(),
  jobTitle: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

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
  app.get('/employees', async (request, reply) => {
    const parsed = ListQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }
    return service.list(parsed.data);
  });

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

  app.patch<{ Params: { id: string } }>('/employees/:id', async (request, reply) => {
    const parsed = UpdateEmployeeSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }
    const updated = await service.update(request.params.id, parsed.data);
    if (!updated) {
      return notFound(reply, request.params.id);
    }
    return updated;
  });

  app.delete<{ Params: { id: string } }>('/employees/:id', async (request, reply) => {
    const removed = await service.delete(request.params.id);
    if (!removed) {
      return notFound(reply, request.params.id);
    }
    return reply.code(204).send();
  });
};
