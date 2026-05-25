import { beforeEach, describe, expect, it } from 'vitest';
import { EmployeeService } from '../src/services/employee-service';
import { InMemoryEmployeeRepository } from '../src/repositories/in-memory-employee-repository';
import type { CreateEmployee } from '@salary/shared';

const validInput: CreateEmployee = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
  email: 'jane.doe@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
};

// A deterministic id generator gives stable assertions and removes the
// need to mock crypto.randomUUID in tests.
const sequentialIds = () => {
  let counter = 0;
  return () => {
    counter += 1;
    return `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`;
  };
};

describe('EmployeeService.create', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  it('returns the new employee with an assigned id', async () => {
    const employee = await service.create(validInput);

    expect(employee.id).toBe('00000000-0000-4000-8000-000000000001');
    expect(employee).toMatchObject(validInput);
  });

  it('assigns a fresh id to every employee', async () => {
    const a = await service.create(validInput);
    const b = await service.create(validInput);

    expect(a.id).not.toBe(b.id);
  });

  it('persists the employee so it can be read back', async () => {
    const created = await service.create(validInput);

    const found = await service.findById(created.id);

    expect(found).toEqual(created);
  });
});

describe('EmployeeService.findById', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  it('returns null when the employee does not exist', async () => {
    const found = await service.findById('00000000-0000-4000-8000-999999999999');
    expect(found).toBeNull();
  });
});

describe('EmployeeService.update', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  it('returns the updated employee with merged fields', async () => {
    const original = await service.create(validInput);

    const updated = await service.update(original.id, {
      jobTitle: 'Senior Software Engineer',
      salary: 2_500_000,
    });

    expect(updated).toEqual({
      ...original,
      jobTitle: 'Senior Software Engineer',
      salary: 2_500_000,
    });
  });

  it('leaves fields that are not in the patch unchanged', async () => {
    const original = await service.create(validInput);

    await service.update(original.id, { salary: 9_999_999 });
    const refetched = await service.findById(original.id);

    expect(refetched).toEqual({ ...original, salary: 9_999_999 });
  });

  it('returns null when the employee does not exist', async () => {
    const result = await service.update('00000000-0000-4000-8000-999999999999', {
      salary: 1,
    });
    expect(result).toBeNull();
  });

  it('persists the change so a subsequent read sees it', async () => {
    const original = await service.create(validInput);
    await service.update(original.id, { country: 'US' });

    const refetched = await service.findById(original.id);

    expect(refetched?.country).toBe('US');
  });
});

describe('EmployeeService.delete', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  it('returns true when the employee existed and was removed', async () => {
    const created = await service.create(validInput);

    const deleted = await service.delete(created.id);

    expect(deleted).toBe(true);
  });

  it('returns false when the employee does not exist', async () => {
    const deleted = await service.delete('00000000-0000-4000-8000-999999999999');
    expect(deleted).toBe(false);
  });

  it('makes the employee unreadable after deletion', async () => {
    const created = await service.create(validInput);

    await service.delete(created.id);

    expect(await service.findById(created.id)).toBeNull();
  });

  it('is idempotent on a second call', async () => {
    const created = await service.create(validInput);
    await service.delete(created.id);

    const second = await service.delete(created.id);

    expect(second).toBe(false);
  });
});

describe('EmployeeService.list', () => {
  let service: EmployeeService;

  const seedNamed = async (count: number) => {
    for (let i = 0; i < count; i += 1) {
      await service.create({
        ...validInput,
        fullName: `Employee ${String(i + 1).padStart(3, '0')}`,
        email: `employee${i + 1}@example.com`,
      });
    }
  };

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  it('returns an empty page for an empty repository', async () => {
    const result = await service.list();

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('returns every employee when total fits inside one page', async () => {
    await seedNamed(3);

    const result = await service.list({ page: 1, pageSize: 10 });

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('orders results alphabetically by fullName for stable pagination', async () => {
    await service.create({ ...validInput, fullName: 'Zoe Sharma' });
    await service.create({ ...validInput, fullName: 'Adam Kapoor' });
    await service.create({ ...validInput, fullName: 'Mia Patel' });

    const result = await service.list({ page: 1, pageSize: 10 });

    expect(result.items.map((e) => e.fullName)).toEqual([
      'Adam Kapoor',
      'Mia Patel',
      'Zoe Sharma',
    ]);
  });

  it('returns the requested page slice', async () => {
    await seedNamed(25);

    const page2 = await service.list({ page: 2, pageSize: 10 });

    expect(page2.items).toHaveLength(10);
    expect(page2.items[0]?.fullName).toBe('Employee 011');
    expect(page2.items[9]?.fullName).toBe('Employee 020');
    expect(page2.total).toBe(25);
    expect(page2.page).toBe(2);
    expect(page2.pageSize).toBe(10);
  });

  it('returns an empty page past the last page (without changing total)', async () => {
    await seedNamed(5);

    const past = await service.list({ page: 10, pageSize: 10 });

    expect(past.items).toEqual([]);
    expect(past.total).toBe(5);
  });

  it('applies sensible defaults when no query is supplied', async () => {
    await seedNamed(3);

    const result = await service.list();

    expect(result.page).toBe(1);
    expect(result.pageSize).toBeGreaterThan(0);
    expect(result.items).toHaveLength(3);
  });

  it('caps pageSize so a caller cannot ask for everything in one call', async () => {
    await seedNamed(5);

    const result = await service.list({ pageSize: 100_000 });

    expect(result.pageSize).toBeLessThanOrEqual(200);
  });
});

describe('EmployeeService.list filtering', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(new InMemoryEmployeeRepository(), sequentialIds());
  });

  const make = (overrides: Partial<CreateEmployee>) =>
    service.create({ ...validInput, ...overrides });

  it('filters by exact country code', async () => {
    await make({ fullName: 'A', country: 'IN' });
    await make({ fullName: 'B', country: 'US' });
    await make({ fullName: 'C', country: 'IN' });

    const result = await service.list({ country: 'IN' });

    expect(result.total).toBe(2);
    expect(result.items.map((e) => e.fullName)).toEqual(['A', 'C']);
  });

  it('filters by exact jobTitle', async () => {
    await make({ fullName: 'A', jobTitle: 'Engineer' });
    await make({ fullName: 'B', jobTitle: 'Designer' });
    await make({ fullName: 'C', jobTitle: 'Engineer' });

    const result = await service.list({ jobTitle: 'Engineer' });

    expect(result.total).toBe(2);
    expect(result.items.map((e) => e.fullName)).toEqual(['A', 'C']);
  });

  it('search matches a case-insensitive substring of fullName', async () => {
    await make({ fullName: 'Jane Doe' });
    await make({ fullName: 'John Smith' });
    await make({ fullName: 'Janet Roe' });

    const result = await service.list({ search: 'jan' });

    expect(result.items.map((e) => e.fullName).sort()).toEqual(['Jane Doe', 'Janet Roe']);
  });

  it('combines filters with AND semantics', async () => {
    await make({ fullName: 'A', country: 'IN', jobTitle: 'Engineer' });
    await make({ fullName: 'B', country: 'IN', jobTitle: 'Designer' });
    await make({ fullName: 'C', country: 'US', jobTitle: 'Engineer' });

    const result = await service.list({ country: 'IN', jobTitle: 'Engineer' });

    expect(result.total).toBe(1);
    expect(result.items[0]?.fullName).toBe('A');
  });

  it('paginates over the filtered set, not the full table', async () => {
    for (let i = 0; i < 15; i += 1) {
      await make({ fullName: `IN ${String(i + 1).padStart(2, '0')}`, country: 'IN' });
    }
    for (let i = 0; i < 5; i += 1) {
      await make({ fullName: `US ${String(i + 1).padStart(2, '0')}`, country: 'US' });
    }

    const page2 = await service.list({ country: 'IN', page: 2, pageSize: 10 });

    expect(page2.total).toBe(15);
    expect(page2.items).toHaveLength(5);
    expect(page2.items[0]?.fullName).toBe('IN 11');
  });

  it('returns an empty page when no employee matches', async () => {
    await make({ fullName: 'A', country: 'IN' });

    const result = await service.list({ country: 'DE' });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
