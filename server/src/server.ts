import { buildApp } from './app';
import { createDb } from './db/client';
import { SqliteEmployeeRepository } from './repositories/sqlite-employee-repository';
import { EmployeeService } from './services/employee-service';
import { InsightsService } from './services/insights-service';

const dbPath = process.env.DATABASE_PATH ?? './data.db';
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const main = async (): Promise<void> => {
  const { db } = createDb(dbPath);
  const repo = new SqliteEmployeeRepository(db);
  const employees = new EmployeeService(repo);
  const insights = new InsightsService(repo);

  const app = buildApp({ employees, insights }, { logger: true });

  await app.listen({ port, host });
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('failed to start server:', err);
  process.exit(1);
});
