import { describe, expect, expectTypeOf, it } from 'vitest';
import { CreateEmployeeSchema, type CreateEmployee } from '../src/employee';

const validCreatePayload = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
  email: 'jane.doe@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
};

describe('CreateEmployeeSchema', () => {
  it('accepts a payload with every required field and no id', () => {
    const result = CreateEmployeeSchema.safeParse(validCreatePayload);
    expect(result.success).toBe(true);
  });

  it('rejects a payload that includes an id', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...validCreatePayload,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a payload missing a required field', () => {
    const { fullName: _omit, ...rest } = validCreatePayload;
    const result = CreateEmployeeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (catches typos before they hit the DB)', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...validCreatePayload,
      salaryAmt: 50_000, // looks like a typo for "salary"
    });
    expect(result.success).toBe(false);
  });

  it('still applies field-level validation (e.g. invalid country)', () => {
    const result = CreateEmployeeSchema.safeParse({ ...validCreatePayload, country: 'usa' });
    expect(result.success).toBe(false);
  });

  it('inferred type does not include id', () => {
    expectTypeOf<CreateEmployee>().not.toHaveProperty('id');
  });
});
