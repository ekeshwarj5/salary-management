import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { CreateEmployee } from '@salary/shared';
import { buildApp } from '../../src/app';
import { EmployeeService } from '../../src/services/employee-service';
import { InMemoryEmployeeRepository } from '../../src/repositories/in-memory-employee-repository';

const validPayload: CreateEmployee = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
  email: 'jane.doe@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
};

const sequentialIds = () => {
  let counter = 0;
  return () => {
    counter += 1;
    return `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`;
  };
};

describe('POST /employees', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
    app = buildApp(service);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 201 with the created employee', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toMatchObject(validPayload);
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('returns 400 with ValidationError for an invalid country', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: { ...validPayload, country: 'usa' },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.error).toBe('ValidationError');
    expect(body.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['country'] })]),
    );
  });

  it('returns 400 when a required field is missing', async () => {
    const { salary: _omit, ...rest } = validPayload;

    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: rest,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('ValidationError');
  });

  it('returns 400 when the body includes an id (id is server-assigned)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: { ...validPayload, id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when the body includes an unknown field (likely typo)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employees',
      payload: { ...validPayload, salaryAmt: 5_000 },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('GET /employees/:id', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
    app = buildApp(service);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with the employee when it exists', async () => {
    const created = (
      await app.inject({ method: 'POST', url: '/employees', payload: validPayload })
    ).json();

    const response = await app.inject({ method: 'GET', url: `/employees/${created.id}` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(created);
  });

  it('returns 404 when the employee does not exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/employees/00000000-0000-4000-8000-999999999999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('NotFound');
  });

  it('returns 404 for a non-UUID id (treated as not found)', async () => {
    const response = await app.inject({ method: 'GET', url: '/employees/garbage' });
    expect(response.statusCode).toBe(404);
  });
});
