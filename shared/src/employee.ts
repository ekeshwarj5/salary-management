import { z } from 'zod';

export const EmployeeSchema = z.object({
  fullName: z.string().trim().min(1),
});

export type Employee = z.infer<typeof EmployeeSchema>;
