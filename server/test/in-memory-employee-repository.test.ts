import { InMemoryEmployeeRepository } from '../src/repositories/in-memory-employee-repository';
import { runEmployeeRepositoryContract } from './employee-repository.contract';

runEmployeeRepositoryContract(
  'InMemoryEmployeeRepository',
  () => new InMemoryEmployeeRepository(),
);
