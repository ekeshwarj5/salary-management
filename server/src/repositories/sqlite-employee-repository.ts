import { and, count, eq, sql, type SQL } from 'drizzle-orm';
import type { Employee, UpdateEmployee } from '@salary/shared';
import type { Db } from '../db/client';
import { employees } from '../db/schema';
import type {
  EmployeeRepository,
  ListQuery,
  ListResult,
} from '../services/employee-service';

/**
 * SQLite-backed EmployeeRepository. Operations are synchronous under the
 * hood (better-sqlite3) and wrapped in `async` so the repository's
 * `Promise<…>` contract is honoured without imposing the cost of real
 * task scheduling.
 *
 * All behaviour is covered by `runEmployeeRepositoryContract` in
 * `test/sqlite-employee-repository.test.ts`.
 */
export class SqliteEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: Db) {}

  async insert(employee: Employee): Promise<void> {
    this.db.insert(employees).values(employee).run();
  }

  async findById(id: string): Promise<Employee | null> {
    const row = this.db.select().from(employees).where(eq(employees.id, id)).get();
    return row ?? null;
  }

  async update(id: string, patch: UpdateEmployee): Promise<Employee | null> {
    const [row] = this.db
      .update(employees)
      .set(patch)
      .where(eq(employees.id, id))
      .returning()
      .all();
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.delete(employees).where(eq(employees.id, id)).run();
    return result.changes > 0;
  }

  async findAll(): Promise<Employee[]> {
    return this.db.select().from(employees).all();
  }

  async list(query: ListQuery): Promise<ListResult> {
    const conditions: SQL[] = [];
    if (query.country) conditions.push(eq(employees.country, query.country));
    if (query.jobTitle) conditions.push(eq(employees.jobTitle, query.jobTitle));
    if (query.search) {
      // SQLite's LIKE is case-insensitive for ASCII by default, but lowering
      // both sides makes the behaviour explicit and portable.
      const needle = `%${query.search.toLowerCase()}%`;
      conditions.push(sql`lower(${employees.fullName}) LIKE ${needle}`);
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = this.db
      .select()
      .from(employees)
      .where(where)
      .orderBy(employees.fullName, employees.id)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize)
      .all();

    const totalRow = this.db.select({ value: count() }).from(employees).where(where).get();
    const total = totalRow?.value ?? 0;

    return { items, total, page: query.page, pageSize: query.pageSize };
  }
}
