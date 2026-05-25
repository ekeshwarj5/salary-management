import type { CreateEmployee, Employee, UpdateEmployee } from '@salary/shared';

/**
 * Filters applied before pagination. country and jobTitle match exactly
 * (UI typically drives these through dropdowns of distinct values);
 * search is a case-insensitive substring match on fullName.
 */
export interface ListFilters {
  country?: string;
  jobTitle?: string;
  search?: string;
}

/**
 * Normalised query passed to the repository. The service is responsible
 * for applying defaults / bounds; the repository simply returns the slice
 * described by these fields.
 */
export interface ListQuery extends ListFilters {
  page: number;
  pageSize: number;
}

export interface ListResult {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

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
  delete(id: string): Promise<boolean>;
  list(query: ListQuery): Promise<ListResult>;
  /**
   * Returns every employee. Used by the analytics layer, which needs
   * the full dataset to compute medians and per-currency aggregations.
   * Not exposed over HTTP — list() with pagination is the public path.
   */
  findAll(): Promise<Employee[]>;
}

export interface ListOptions extends ListFilters {
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

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

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const requested = Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
    const query: ListQuery = { page, pageSize };
    if (options.country) query.country = options.country;
    if (options.jobTitle) query.jobTitle = options.jobTitle;
    if (options.search) query.search = options.search;
    return this.repo.list(query);
  }
}
