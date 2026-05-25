import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export type Db = BetterSQLite3Database;

/**
 * Create a Drizzle-wrapped better-sqlite3 client and ensure the schema
 * exists. `:memory:` is the right choice for tests; a file path is used
 * in dev / prod.
 *
 * WAL mode is enabled on file-backed databases so reads don't block writes;
 * it's a no-op for the in-memory database.
 */
export const createDb = (path: string): Db => {
  const sqlite = new Database(path);
  if (path !== ':memory:') {
    sqlite.pragma('journal_mode = WAL');
  }
  sqlite.pragma('foreign_keys = ON');
  ensureSchema(sqlite);
  return drizzle(sqlite);
};

/**
 * Programmatic schema creation. We keep this co-located with the Drizzle
 * schema so the two stay in sync; if columns are added in `schema.ts`,
 * the matching CREATE statement here is the second edit.
 *
 * Using IF NOT EXISTS makes the call idempotent for both dev and tests.
 */
const ensureSchema = (sqlite: Database.Database): void => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      country TEXT NOT NULL,
      salary REAL NOT NULL,
      currency TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      joined_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country);
    CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title);
    CREATE INDEX IF NOT EXISTS idx_employees_country_job_title
      ON employees(country, job_title);
  `);
};
