import { describe, expect, it } from 'vitest';
import { EmployeeSchema } from '../src/employee';

describe('EmployeeSchema', () => {
  describe('fullName', () => {
    it('accepts a non-empty fullName', () => {
      const result = EmployeeSchema.safeParse({ fullName: 'Jane Doe' });
      expect(result.success).toBe(true);
    });

    it('rejects an empty fullName', () => {
      const result = EmployeeSchema.safeParse({ fullName: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only fullName', () => {
      const result = EmployeeSchema.safeParse({ fullName: '   ' });
      expect(result.success).toBe(false);
    });

    it('trims surrounding whitespace from fullName', () => {
      const result = EmployeeSchema.safeParse({ fullName: '  Jane Doe  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Jane Doe');
      }
    });

    it('rejects a missing fullName', () => {
      const result = EmployeeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
