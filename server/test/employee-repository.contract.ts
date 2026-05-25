import { beforeEach, describe, expect, it } from 'vitest';
import type { Employee } from '@salary/shared';
import type { EmployeeRepository } from '../src/services/employee-service';

/**
 * Shared behavioural contract for any `EmployeeRepository`.
 *
 * Both the in-memory implementation and the SQLite implementation run
 * this suite. If the two ever diverge at this boundary, one of them is
 * wrong — the suite is the spec.
 *
 * The contract intentionally avoids service-level concerns (id generation,
 * pageSize defaults, etc). Those belong to `EmployeeService` and have
 * their own tests.
 */
export const runEmployeeRepositoryContract = (
  label: string,
  factory: () => EmployeeRepository,
): void => {
  describe(`${label} (EmployeeRepository contract)`, () => {
    let repo: EmployeeRepository;

    beforeEach(() => {
      repo = factory();
    });

    const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

    const employee = (overrides: Partial<Employee> = {}): Employee => ({
      id: overrides.id ?? uuid(1),
      fullName: 'Jane Doe',
      jobTitle: 'Engineer',
      country: 'IN',
      salary: 1_000_000,
      currency: 'INR',
      email: `${overrides.id ?? uuid(1)}@example.com`,
      department: 'Engineering',
      joinedAt: '2022-04-01',
      ...overrides,
    });

    describe('insert / findById', () => {
      it('round-trips a record', async () => {
        const e = employee();
        await repo.insert(e);

        expect(await repo.findById(e.id)).toEqual(e);
      });

      it('returns null for an unknown id', async () => {
        expect(await repo.findById(uuid(999))).toBeNull();
      });
    });

    describe('findAll', () => {
      it('returns an empty array for an empty repo', async () => {
        expect(await repo.findAll()).toEqual([]);
      });

      it('returns every inserted employee (analytics path)', async () => {
        await repo.insert(employee({ id: uuid(1) }));
        await repo.insert(employee({ id: uuid(2) }));

        const all = await repo.findAll();

        expect(all).toHaveLength(2);
        expect(all.map((e) => e.id).sort()).toEqual([uuid(1), uuid(2)]);
      });
    });

    describe('update', () => {
      it('merges the patch and persists it', async () => {
        const e = employee();
        await repo.insert(e);

        const updated = await repo.update(e.id, { salary: 2_000_000, jobTitle: 'Senior' });

        expect(updated).toEqual({ ...e, salary: 2_000_000, jobTitle: 'Senior' });
        expect(await repo.findById(e.id)).toEqual(updated);
      });

      it('returns null for an unknown id', async () => {
        const result = await repo.update(uuid(999), { salary: 1 });
        expect(result).toBeNull();
      });

      it('leaves unrelated fields alone', async () => {
        const e = employee();
        await repo.insert(e);

        await repo.update(e.id, { country: 'US' });
        const found = await repo.findById(e.id);

        expect(found?.fullName).toBe(e.fullName);
        expect(found?.salary).toBe(e.salary);
        expect(found?.country).toBe('US');
      });
    });

    describe('delete', () => {
      it('returns true when the row existed', async () => {
        const e = employee();
        await repo.insert(e);

        expect(await repo.delete(e.id)).toBe(true);
        expect(await repo.findById(e.id)).toBeNull();
      });

      it('returns false when the row did not exist', async () => {
        expect(await repo.delete(uuid(999))).toBe(false);
      });

      it('is idempotent — a second delete returns false', async () => {
        const e = employee();
        await repo.insert(e);

        await repo.delete(e.id);
        expect(await repo.delete(e.id)).toBe(false);
      });
    });

    describe('list', () => {
      const seedThree = async () => {
        await repo.insert(employee({ id: uuid(1), fullName: 'Zoe Sharma', country: 'IN' }));
        await repo.insert(employee({ id: uuid(2), fullName: 'Adam Kapoor', country: 'US' }));
        await repo.insert(employee({ id: uuid(3), fullName: 'Mia Patel', country: 'IN' }));
      };

      it('returns an empty page from an empty repo', async () => {
        const result = await repo.list({ page: 1, pageSize: 10 });
        expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
      });

      it('orders by fullName ascending for stable pagination', async () => {
        await seedThree();

        const result = await repo.list({ page: 1, pageSize: 10 });

        expect(result.items.map((e) => e.fullName)).toEqual([
          'Adam Kapoor',
          'Mia Patel',
          'Zoe Sharma',
        ]);
        expect(result.total).toBe(3);
      });

      it('paginates correctly', async () => {
        for (let i = 1; i <= 25; i += 1) {
          await repo.insert(
            employee({
              id: uuid(i),
              fullName: `Employee ${i.toString().padStart(3, '0')}`,
              email: `e${i}@example.com`,
            }),
          );
        }

        const page2 = await repo.list({ page: 2, pageSize: 10 });

        expect(page2.items).toHaveLength(10);
        expect(page2.items[0]?.fullName).toBe('Employee 011');
        expect(page2.items[9]?.fullName).toBe('Employee 020');
        expect(page2.total).toBe(25);
      });

      it('filters by country (exact match)', async () => {
        await seedThree();

        const result = await repo.list({ page: 1, pageSize: 10, country: 'IN' });

        expect(result.total).toBe(2);
        expect(result.items.map((e) => e.fullName).sort()).toEqual(['Mia Patel', 'Zoe Sharma']);
      });

      it('filters by jobTitle (exact match)', async () => {
        await repo.insert(employee({ id: uuid(1), jobTitle: 'Engineer' }));
        await repo.insert(employee({ id: uuid(2), jobTitle: 'Designer' }));
        await repo.insert(employee({ id: uuid(3), jobTitle: 'Engineer' }));

        const result = await repo.list({ page: 1, pageSize: 10, jobTitle: 'Engineer' });

        expect(result.total).toBe(2);
      });

      it('search matches a case-insensitive substring on fullName', async () => {
        await seedThree();

        const result = await repo.list({ page: 1, pageSize: 10, search: 'mIA' });

        expect(result.items.map((e) => e.fullName)).toEqual(['Mia Patel']);
      });

      it('combines filters with AND semantics', async () => {
        await repo.insert(employee({ id: uuid(1), country: 'IN', jobTitle: 'Engineer' }));
        await repo.insert(employee({ id: uuid(2), country: 'IN', jobTitle: 'Designer' }));
        await repo.insert(employee({ id: uuid(3), country: 'US', jobTitle: 'Engineer' }));

        const result = await repo.list({
          page: 1,
          pageSize: 10,
          country: 'IN',
          jobTitle: 'Engineer',
        });

        expect(result.total).toBe(1);
      });
    });
  });
};
