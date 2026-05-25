import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export type Db = BetterSQLite3Database;

export interface DbContext {
  /** Drizzle-wrapped query API used by repositories and routes. */
  db: Db;
  /** Raw better-sqlite3 connection. Use only for hot paths that need
   *  prepared statements + transactions (e.g. the bulk seed). */
  sqlite: Database.Database;
}

/**
 * Open a database, enable WAL on file-backed paths, and idempotently
 * ensure the schema. Same call path runs in tests (:memory:) and prod.
 */
export const createDb = (path: string): DbContext => {
  const sqlite = new Database(path);
  if (path !== ':memory:') {
    sqlite.pragma('journal_mode = WAL');
  }
  sqlite.pragma('foreign_keys = ON');
  ensureSchema(sqlite);
  return { db: drizzle(sqlite), sqlite };
};

/**
 * Programmatic schema creation, kept co-located with the Drizzle table
 * definition. If columns are added in `schema.ts`, the matching CREATE
 * statement here is the second edit.
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
