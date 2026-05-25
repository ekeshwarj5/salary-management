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

describe('PATCH /employees/:id', () => {
  let app: FastifyInstance;

  const createOne = async () =>
    (await app.inject({ method: 'POST', url: '/employees', payload: validPayload })).json();

  beforeEach(async () => {
    const service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
    app = buildApp(service);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with the merged employee', async () => {
    const created = await createOne();

    const response = await app.inject({
      method: 'PATCH',
      url: `/employees/${created.id}`,
      payload: { salary: 2_500_000, jobTitle: 'Senior Engineer' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ...created,
      salary: 2_500_000,
      jobTitle: 'Senior Engineer',
    });
  });

  it('persists the change (subsequent GET returns the new values)', async () => {
    const created = await createOne();

    await app.inject({
      method: 'PATCH',
      url: `/employees/${created.id}`,
      payload: { country: 'US' },
    });
    const refetched = (
      await app.inject({ method: 'GET', url: `/employees/${created.id}` })
    ).json();

    expect(refetched.country).toBe('US');
  });

  it('returns 404 when the employee does not exist', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/employees/00000000-0000-4000-8000-999999999999',
      payload: { salary: 1 },
    });

    expect(response.statusCode).toBe(404);
  });

  it('returns 400 when the payload is empty', async () => {
    const created = await createOne();

    const response = await app.inject({
      method: 'PATCH',
      url: `/employees/${created.id}`,
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when the payload tries to change id', async () => {
    const created = await createOne();

    const response = await app.inject({
      method: 'PATCH',
      url: `/employees/${created.id}`,
      payload: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when a field value is invalid', async () => {
    const created = await createOne();

    const response = await app.inject({
      method: 'PATCH',
      url: `/employees/${created.id}`,
      payload: { country: 'usa' },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /employees/:id', () => {
  let app: FastifyInstance;

  const createOne = async () =>
    (await app.inject({ method: 'POST', url: '/employees', payload: validPayload })).json();

  beforeEach(async () => {
    const service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
    app = buildApp(service);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 204 with an empty body when the employee existed', async () => {
    const created = await createOne();

    const response = await app.inject({ method: 'DELETE', url: `/employees/${created.id}` });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });

  it('makes the employee unreadable afterwards', async () => {
    const created = await createOne();

    await app.inject({ method: 'DELETE', url: `/employees/${created.id}` });
    const get = await app.inject({ method: 'GET', url: `/employees/${created.id}` });

    expect(get.statusCode).toBe(404);
  });

  it('returns 404 when the employee does not exist', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/employees/00000000-0000-4000-8000-999999999999',
    });

    expect(response.statusCode).toBe(404);
  });
});

describe('GET /employees', () => {
  let app: FastifyInstance;

  const seed = async (overrides: Partial<CreateEmployee>) =>
    (
      await app.inject({
        method: 'POST',
        url: '/employees',
        payload: { ...validPayload, ...overrides },
      })
    ).json();

  beforeEach(async () => {
    const service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
    app = buildApp(service);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns an empty page from an empty repo', async () => {
    const response = await app.inject({ method: 'GET', url: '/employees' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: expect.any(Number),
    });
  });

  it('paginates with explicit page and pageSize', async () => {
    for (let i = 1; i <= 25; i += 1) {
      await seed({
        fullName: `Employee ${String(i).padStart(3, '0')}`,
        email: `e${i}@example.com`,
      });
    }

    const response = await app.inject({ method: 'GET', url: '/employees?page=2&pageSize=10' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toHaveLength(10);
    expect(body.total).toBe(25);
    expect(body.page).toBe(2);
    expect(body.pageSize).toBe(10);
    expect(body.items[0].fullName).toBe('Employee 011');
  });

  it('filters by country', async () => {
    await seed({ fullName: 'A', country: 'IN', email: 'a@x.com' });
    await seed({ fullName: 'B', country: 'US', email: 'b@x.com' });
    await seed({ fullName: 'C', country: 'IN', email: 'c@x.com' });

    const response = await app.inject({ method: 'GET', url: '/employees?country=IN' });

    expect(response.json().total).toBe(2);
  });

  it('filters by jobTitle', async () => {
    await seed({ fullName: 'A', jobTitle: 'Engineer', email: 'a@x.com' });
    await seed({ fullName: 'B', jobTitle: 'Designer', email: 'b@x.com' });

    const response = await app.inject({
      method: 'GET',
      url: '/employees?jobTitle=Engineer',
    });

    expect(response.json().total).toBe(1);
  });

  it('searches by case-insensitive substring on fullName', async () => {
    await seed({ fullName: 'Jane Doe', email: 'jane@x.com' });
    await seed({ fullName: 'John Smith', email: 'john@x.com' });

    const response = await app.inject({ method: 'GET', url: '/employees?search=JANE' });

    const body = response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].fullName).toBe('Jane Doe');
  });

  it('returns 400 for a malformed country query', async () => {
    const response = await app.inject({ method: 'GET', url: '/employees?country=usa' });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('ValidationError');
  });

  it('returns 400 for a non-numeric page', async () => {
    const response = await app.inject({ method: 'GET', url: '/employees?page=abc' });

    expect(response.statusCode).toBe(400);
  });
});
