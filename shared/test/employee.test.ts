import { describe, expect, it } from 'vitest';
import { EmployeeSchema } from '../src/employee';

// A record that satisfies every required field on EmployeeSchema.
// As the schema grows, only this constant needs updating.
const validEmployee = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
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
});
