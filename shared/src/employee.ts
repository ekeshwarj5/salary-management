import { z } from 'zod';

const requiredText = (max = 100) => z.string().trim().min(1).max(max);

// ISO-3166-1 alpha-2: two uppercase letters (e.g. "IN", "US", "DE").
// Stored as a code rather than free text so analytics aggregations stay
// consistent. The UI is expected to resolve codes to display names.
const countryCode = z.string().regex(/^[A-Z]{2}$/, {
  message: 'country must be an ISO-3166-1 alpha-2 code (two uppercase letters)',
});

// ISO-4217 currency code: three uppercase letters (e.g. "INR", "USD").
const currencyCode = z.string().regex(/^[A-Z]{3}$/, {
  message: 'currency must be an ISO-4217 code (three uppercase letters)',
});

// Salary is a positive, finite number. Decimals are permitted so the schema
// can represent locales / pay structures that include fractional units; the
// storage layer is free to apply its own precision rules.
const salary = z.number().positive().finite();

const email = z.string().email();

// joinedAt is a date, not a datetime. HR records "the day they joined";
// time-of-day adds no signal and would force every consumer to strip it.
// Accepts strict YYYY-MM-DD and rejects calendar-invalid days (e.g. month 13).
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const joinedAt = z.string().refine(
  (value) => {
    if (!ISO_DATE_RE.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    // Reject calendar overflow: Date() silently rolls "2020-02-31" to March.
    return value === date.toISOString().slice(0, 10);
  },
  { message: 'joinedAt must be a valid YYYY-MM-DD date' },
);

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  fullName: requiredText(),
  jobTitle: requiredText(),
  country: countryCode,
  salary,
  currency: currencyCode,
  email,
  department: requiredText(),
  joinedAt,
});

export type Employee = z.infer<typeof EmployeeSchema>;

// Payload for creating an employee. The id is assigned by the server, so
// callers cannot pass one - strict() rejects any extra keys (including 'id')
// to make typos and id-injection attempts loud rather than silent.
export const CreateEmployeeSchema = EmployeeSchema.omit({ id: true }).strict();

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;

// Payload for updating an employee. Every editable field is optional, but
// an empty payload is rejected - a no-op update is almost certainly a
// caller bug. id is not updatable.
export const UpdateEmployeeSchema = EmployeeSchema.omit({ id: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'update payload must contain at least one field',
  });

export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
