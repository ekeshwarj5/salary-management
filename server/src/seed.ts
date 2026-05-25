import { performance } from 'node:perf_hooks';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createDb } from './db/client';

interface SeedOptions {
  count: number;
  dbPath: string;
  rngSeed?: number;
}

/**
 * Each country profile pairs a country code with its currency and a
 * realistic salary band for that market. Salaries are random within the
 * band; the resulting dataset gives the insights queries enough variance
 * to demonstrate min/max/avg/median meaningfully.
 */
const COUNTRY_PROFILES = [
  { country: 'IN', currency: 'INR', salaryMin: 400_000, salaryMax: 8_000_000 },
  { country: 'US', currency: 'USD', salaryMin: 55_000, salaryMax: 380_000 },
  { country: 'GB', currency: 'GBP', salaryMin: 32_000, salaryMax: 240_000 },
  { country: 'DE', currency: 'EUR', salaryMin: 38_000, salaryMax: 200_000 },
  { country: 'FR', currency: 'EUR', salaryMin: 34_000, salaryMax: 180_000 },
  { country: 'CA', currency: 'CAD', salaryMin: 50_000, salaryMax: 220_000 },
  { country: 'AU', currency: 'AUD', salaryMin: 60_000, salaryMax: 240_000 },
  { country: 'SG', currency: 'SGD', salaryMin: 55_000, salaryMax: 260_000 },
  { country: 'JP', currency: 'JPY', salaryMin: 4_000_000, salaryMax: 22_000_000 },
  { country: 'BR', currency: 'BRL', salaryMin: 60_000, salaryMax: 480_000 },
  { country: 'NL', currency: 'EUR', salaryMin: 40_000, salaryMax: 190_000 },
  { country: 'AE', currency: 'AED', salaryMin: 90_000, salaryMax: 700_000 },
] as const;

const JOB_TITLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Engineer',
  'Engineering Manager',
  'Product Manager',
  'Senior Product Manager',
  'Designer',
  'Senior Designer',
  'Marketing Manager',
  'Sales Executive',
  'HR Manager',
  'Finance Analyst',
  'Operations Lead',
  'Data Scientist',
  'Data Engineer',
  'QA Engineer',
  'DevOps Engineer',
  'Recruiter',
  'Customer Success Manager',
  'Director of Engineering',
] as const;

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'IT',
] as const;

/**
 * Mulberry32: a small, fast PRNG suitable for reproducible seeding.
 * The default Math.random() is unseeded; passing --seed=N here makes
 * test datasets stable across runs.
 */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const readLines = (path: string): string[] =>
  readFileSync(path, 'utf8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const pick = <T>(arr: readonly T[], rand: () => number): T => arr[Math.floor(rand() * arr.length)]!;

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');

const seed = (options: SeedOptions): void => {
  const firstNames = readLines(`${dataDir}/first_names.txt`);
  const lastNames = readLines(`${dataDir}/last_names.txt`);

  const rand = options.rngSeed !== undefined ? mulberry32(options.rngSeed) : Math.random;

  const { sqlite } = createDb(options.dbPath);

  // Truncate so re-runs are idempotent and the email UNIQUE constraint
  // never trips on a counter collision.
  sqlite.exec('DELETE FROM employees');

  // Prepared statement: parse once, bind many times. Combined with the
  // surrounding transaction, this is the fastest bulk-insert pattern
  // better-sqlite3 supports.
  const insert = sqlite.prepare(`
    INSERT INTO employees
      (id, full_name, job_title, country, salary, currency, email, department, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = sqlite.transaction((count: number) => {
    for (let i = 0; i < count; i += 1) {
      const firstName = pick(firstNames, rand);
      const lastName = pick(lastNames, rand);
      const profile = pick(COUNTRY_PROFILES, rand);
      const jobTitle = pick(JOB_TITLES, rand);
      const department = pick(DEPARTMENTS, rand);
      const salaryRange = profile.salaryMax - profile.salaryMin;
      const salary = Math.round((profile.salaryMin + rand() * salaryRange) / 100) * 100;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`;
      const year = 2015 + Math.floor(rand() * 11);
      const month = String(1 + Math.floor(rand() * 12)).padStart(2, '0');
      const day = String(1 + Math.floor(rand() * 28)).padStart(2, '0');
      const joinedAt = `${year}-${month}-${day}`;
      insert.run(
        randomUUID(),
        `${firstName} ${lastName}`,
        jobTitle,
        profile.country,
        salary,
        profile.currency,
        email,
        department,
        joinedAt,
      );
    }
  });

  const startedAt = performance.now();
  insertAll(options.count);
  const elapsedMs = performance.now() - startedAt;

  const rowsPerSec = Math.round((options.count / elapsedMs) * 1000);
  // eslint-disable-next-line no-console
  console.log(
    `seeded ${options.count.toLocaleString()} employees in ${elapsedMs.toFixed(0)}ms ` +
      `(${rowsPerSec.toLocaleString()} rows/sec) -> ${options.dbPath}`,
  );

  sqlite.close();
};

const parseArgs = (argv: string[]): SeedOptions => {
  const options: SeedOptions = { count: 10_000, dbPath: './data.db' };
  for (const arg of argv) {
    if (arg.startsWith('--count=')) options.count = Number(arg.slice('--count='.length));
    else if (arg.startsWith('--db=')) options.dbPath = arg.slice('--db='.length);
    else if (arg.startsWith('--seed=')) options.rngSeed = Number(arg.slice('--seed='.length));
  }
  return options;
};

seed(parseArgs(process.argv.slice(2)));
