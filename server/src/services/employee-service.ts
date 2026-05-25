import type { CreateEmployee, Employee, UpdateEmployee } from '@salary/shared';

/**
 * Persistence port for the Employee aggregate. Services depend on this
 * interface rather than a concrete database implementation, so business
 * logic can be unit-tested with an in-memory implementation and the same
 * contract can be satisfied by SQLite (Drizzle), Postgres, etc.
 */
export interface EmployeeRepository {
  insert(employee: Employee): Promise<void>;
  findById(id: string): Promise<Employee | null>;
  update(id: string, patch: UpdateEmployee): Promise<Employee | null>;
}

export type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => crypto.randomUUID();

export class EmployeeService {
  constructor(
    private readonly repo: EmployeeRepository,
    private readonly generateId: IdGenerator = defaultIdGenerator,
  ) {}

  async create(input: CreateEmployee): Promise<Employee> {
    const employee: Employee = { id: this.generateId(), ...input };
    await this.repo.insert(employee);
    return employee;
  }

  async findById(id: string): Promise<Employee | null> {
    return this.repo.findById(id);
  }

  async update(id: string, patch: UpdateEmployee): Promise<Employee | null> {
    return this.repo.update(id, patch);
  }
}
