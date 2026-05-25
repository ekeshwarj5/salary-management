import { z } from 'zod';

const requiredText = (max = 100) => z.string().trim().min(1).max(max);

// ISO-3166-1 alpha-2: two uppercase letters (e.g. "IN", "US", "DE").
// Stored as a code rather than free text so analytics aggregations stay
// consistent. The UI is expected to resolve codes to display names.
const countryCode = z.string().regex(/^[A-Z]{2}$/, {
  message: 'country must be an ISO-3166-1 alpha-2 code (two uppercase letters)',
});

export const EmployeeSchema = z.object({
  fullName: requiredText(),
  jobTitle: requiredText(),
  country: countryCode,
});

export type Employee = z.infer<typeof EmployeeSchema>;
