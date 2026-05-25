import { z } from 'zod';

const requiredText = (max = 100) => z.string().trim().min(1).max(max);

export const EmployeeSchema = z.object({
  fullName: requiredText(),
  jobTitle: requiredText(),
});

export type Employee = z.infer<typeof EmployeeSchema>;
