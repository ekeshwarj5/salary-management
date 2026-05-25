import { createDb } from '../src/db/client';
import { SqliteEmployeeRepository } from '../src/repositories/sqlite-employee-repository';
import { runEmployeeRepositoryContract } from './employee-repository.contract';

// A fresh in-memory database for every test gives full isolation without
// the cost of cleaning up between cases — the schema is recreated each time
// at near-zero cost.
runEmployeeRepositoryContract(
  'SqliteEmployeeRepository',
  () => new SqliteEmployeeRepository(createDb(':memory:').db),
);
