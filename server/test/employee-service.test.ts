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
