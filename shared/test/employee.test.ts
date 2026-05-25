import { describe, expect, it } from 'vitest';
import { EmployeeSchema } from '../src/employee';

// A record that satisfies every required field on EmployeeSchema.
// As the schema grows, only this constant needs updating.
const validEmployee = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
};

describe('EmployeeSchema', () => {
  describe('fullName', () => {
    it('accepts a non-empty fullName', () => {
      const result = EmployeeSchema.safeParse(validEmployee);
      expect(result.success).toBe(true);
    });

    it('rejects an empty fullName', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, fullName: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only fullName', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, fullName: '   ' });
      expect(result.success).toBe(false);
    });

    it('trims surrounding whitespace from fullName', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, fullName: '  Jane Doe  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Jane Doe');
      }
    });

    it('rejects a missing fullName', () => {
      const { fullName: _omit, ...rest } = validEmployee;
      const result = EmployeeSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects a fullName longer than 100 characters', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, fullName: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('jobTitle', () => {
    it('accepts a non-empty jobTitle', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, jobTitle: 'Engineer' });
      expect(result.success).toBe(true);
    });

    it('rejects an empty jobTitle', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, jobTitle: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only jobTitle', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, jobTitle: '   ' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing jobTitle', () => {
      const { jobTitle: _omit, ...rest } = validEmployee;
      const result = EmployeeSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects a jobTitle longer than 100 characters', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, jobTitle: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });

    it('trims surrounding whitespace from jobTitle', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, jobTitle: '  Engineer  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jobTitle).toBe('Engineer');
      }
    });
  });

  describe('country', () => {
    it('accepts a valid ISO-3166-1 alpha-2 code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, country: 'US' });
      expect(result.success).toBe(true);
    });

    it('rejects a three-letter country code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, country: 'USA' });
      expect(result.success).toBe(false);
    });

    it('rejects a one-letter country code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, country: 'U' });
      expect(result.success).toBe(false);
    });

    it('rejects a lowercase country code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, country: 'us' });
      expect(result.success).toBe(false);
    });

    it('rejects a country code containing a digit', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, country: 'U1' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing country', () => {
      const { country: _omit, ...rest } = validEmployee;
      const result = EmployeeSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe('salary', () => {
    it('accepts a positive integer', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: 50_000 });
      expect(result.success).toBe(true);
    });

    it('accepts a positive decimal', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: 50_000.5 });
      expect(result.success).toBe(true);
    });

    it('rejects zero', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects a negative salary', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects NaN', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: Number.NaN });
      expect(result.success).toBe(false);
    });

    it('rejects Infinity', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: Number.POSITIVE_INFINITY });
      expect(result.success).toBe(false);
    });

    it('rejects a non-numeric salary', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, salary: '50000' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing salary', () => {
      const { salary: _omit, ...rest } = validEmployee;
      const result = EmployeeSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe('currency', () => {
    it('accepts a valid ISO-4217 code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, currency: 'USD' });
      expect(result.success).toBe(true);
    });

    it('rejects a lowercase currency code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, currency: 'usd' });
      expect(result.success).toBe(false);
    });

    it('rejects a two-letter currency code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, currency: 'US' });
      expect(result.success).toBe(false);
    });

    it('rejects a four-letter currency code', () => {
      const result = EmployeeSchema.safeParse({ ...validEmployee, currency: 'USDX' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing currency', () => {
      const { currency: _omit, ...rest } = validEmployee;
      const result = EmployeeSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });
});
