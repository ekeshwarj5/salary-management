import { describe, expect, expectTypeOf, it } from 'vitest';
import { UpdateEmployeeSchema, type UpdateEmployee } from '../src/employee';

describe('UpdateEmployeeSchema', () => {
  it('accepts a single-field update', () => {
    const result = UpdateEmployeeSchema.safeParse({ salary: 2_000_000 });
    expect(result.success).toBe(true);
  });

  it('accepts a multi-field update', () => {
    const result = UpdateEmployeeSchema.safeParse({
      jobTitle: 'Senior Engineer',
      salary: 2_000_000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty update (likely a bug, not an intentional no-op)', () => {
    const result = UpdateEmployeeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an attempt to change id', () => {
    const result = UpdateEmployeeSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      salary: 2_000_000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = UpdateEmployeeSchema.safeParse({ salaryAmt: 2_000_000 });
    expect(result.success).toBe(false);
  });

  it('still applies field-level validation when a field is provided', () => {
    const result = UpdateEmployeeSchema.safeParse({ country: 'usa' });
    expect(result.success).toBe(false);
  });

  it('inferred type makes every editable field optional', () => {
    expectTypeOf<UpdateEmployee>().toEqualTypeOf<{
      fullName?: string;
      jobTitle?: string;
      country?: string;
      salary?: number;
      currency?: string;
      email?: string;
      department?: string;
      joinedAt?: string;
    }>();
  });
});
