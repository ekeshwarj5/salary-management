import type { Employee, UpdateEmployee } from '@salary/shared';
import type { EmployeeRepository, ListQuery, ListResult } from '../services/employee-service';

/**
 * In-memory EmployeeRepository, used for unit tests of the service layer
 * and as a reference implementation for the contract that the SQLite
 * repository must satisfy.
 */
export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly employees = new Map<string, Employee>();

  async insert(employee: Employee): Promise<void> {
    this.employees.set(employee.id, employee);
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employees.get(id) ?? null;
  }

  async update(id: string, patch: UpdateEmployee): Promise<Employee | null> {
    const existing = this.employees.get(id);
    if (!existing) return null;
    const updated: Employee = { ...existing, ...patch };
    this.employees.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  async list(query: ListQuery): Promise<ListResult> {
    const ordered = [...this.employees.values()].sort((a, b) => {
      const byName = a.fullName.localeCompare(b.fullName);
      return byName !== 0 ? byName : a.id.localeCompare(b.id);
    });
    const total = ordered.length;
    const offset = (query.page - 1) * query.pageSize;
    const items = ordered.slice(offset, offset + query.pageSize);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }
}
