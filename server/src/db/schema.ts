import { index, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Drizzle definition of the `employees` table.
 *
 * Salary is stored as REAL so currencies that use fractional units round-trip
 * losslessly. joined_at is stored as a TEXT ISO date (YYYY-MM-DD) — the
 * Employee schema validates the same format, so the column reads identically
 * on the wire and at rest.
 *
 * Indexes are sized for the analytics queries: aggregations by country, by
 * job title, and by both together (e.g. "average salary for Engineer in IN").
 */
export const employees = sqliteTable(
  'employees',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    jobTitle: text('job_title').notNull(),
    country: text('country').notNull(),
    salary: real('salary').notNull(),
    currency: text('currency').notNull(),
    email: text('email').notNull().unique(),
    department: text('department').notNull(),
    joinedAt: text('joined_at').notNull(),
  },
  (table) => [
    index('idx_employees_country').on(table.country),
    index('idx_employees_job_title').on(table.jobTitle),
    index('idx_employees_country_job_title').on(table.country, table.jobTitle),
  ],
);

export type EmployeeRow = typeof employees.$inferSelect;
export type NewEmployeeRow = typeof employees.$inferInsert;
