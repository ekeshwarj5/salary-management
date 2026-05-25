import { beforeEach, describe, expect, it } from 'vitest';
import type { Employee } from '@salary/shared';
import { InsightsService } from '../src/services/insights-service';
import { InMemoryEmployeeRepository } from '../src/repositories/in-memory-employee-repository';

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

const employee = (overrides: Partial<Employee> = {}): Employee => ({
  id: overrides.id ?? uuid(Math.floor(Math.random() * 1_000_000)),
  fullName: 'Jane Doe',
  jobTitle: 'Engineer',
  country: 'IN',
  salary: 1_000_000,
  currency: 'INR',
  email: `${overrides.id ?? Math.random()}@example.com`,
  department: 'Engineering',
  joinedAt: '2022-04-01',
  ...overrides,
});

const buildService = async (employees: Employee[]) => {
  const repo = new InMemoryEmployeeRepository();
  for (const e of employees) {
    await repo.insert(e);
  }
  return new InsightsService(repo);
};

describe('InsightsService.getByCountry', () => {
  it('returns an empty array when there are no employees', async () => {
    const service = await buildService([]);
    expect(await service.getByCountry()).toEqual([]);
  });

  it('aggregates min/max/avg/median for a single country/currency', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', currency: 'INR', salary: 1_000_000 }),
      employee({ id: uuid(2), country: 'IN', currency: 'INR', salary: 2_000_000 }),
      employee({ id: uuid(3), country: 'IN', currency: 'INR', salary: 3_000_000 }),
    ]);

    const result = await service.getByCountry();

    expect(result).toEqual([
      {
        country: 'IN',
        currency: 'INR',
        count: 3,
        minSalary: 1_000_000,
        maxSalary: 3_000_000,
        avgSalary: 2_000_000,
        medianSalary: 2_000_000,
      },
    ]);
  });

  it('computes the median correctly for an even count (average of middle two)', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', salary: 100 }),
      employee({ id: uuid(2), country: 'IN', salary: 200 }),
      employee({ id: uuid(3), country: 'IN', salary: 300 }),
      employee({ id: uuid(4), country: 'IN', salary: 400 }),
    ]);

    const [in_] = await service.getByCountry();

    expect(in_?.medianSalary).toBe(250);
  });

  it('returns one entry per country', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', currency: 'INR' }),
      employee({ id: uuid(2), country: 'US', currency: 'USD' }),
    ]);

    const result = await service.getByCountry();

    expect(result.map((r) => r.country)).toEqual(['IN', 'US']);
  });

  it('splits a country across currencies (no nonsensical cross-currency mean)', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', currency: 'INR', salary: 1_500_000 }),
      employee({ id: uuid(2), country: 'IN', currency: 'INR', salary: 2_500_000 }),
      employee({ id: uuid(3), country: 'IN', currency: 'USD', salary: 100_000 }),
    ]);

    const result = await service.getByCountry();

    expect(result).toHaveLength(2);
    const inr = result.find((r) => r.currency === 'INR')!;
    const usd = result.find((r) => r.currency === 'USD')!;
    expect(inr.count).toBe(2);
    expect(usd.count).toBe(1);
    expect(inr.avgSalary).toBe(2_000_000);
    expect(usd.avgSalary).toBe(100_000);
  });

  it('orders results alphabetically by country', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'US' }),
      employee({ id: uuid(2), country: 'DE' }),
      employee({ id: uuid(3), country: 'IN' }),
    ]);

    const result = await service.getByCountry();

    expect(result.map((r) => r.country)).toEqual(['DE', 'IN', 'US']);
  });
});

describe('InsightsService.getByTitleInCountry', () => {
  it('returns an empty array when the country has no employees', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', jobTitle: 'Engineer' }),
    ]);

    expect(await service.getByTitleInCountry('US')).toEqual([]);
  });

  it('aggregates per job title within the given country only', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', jobTitle: 'Engineer', salary: 1_000_000 }),
      employee({ id: uuid(2), country: 'IN', jobTitle: 'Engineer', salary: 2_000_000 }),
      employee({ id: uuid(3), country: 'IN', jobTitle: 'Designer', salary: 1_500_000 }),
      employee({ id: uuid(4), country: 'US', jobTitle: 'Engineer', salary: 9_999 }),
    ]);

    const result = await service.getByTitleInCountry('IN');

    expect(result).toHaveLength(2);
    const eng = result.find((r) => r.jobTitle === 'Engineer')!;
    expect(eng.count).toBe(2);
    expect(eng.avgSalary).toBe(1_500_000);
    expect(eng.country).toBe('IN');
  });

  it('orders results alphabetically by jobTitle', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', jobTitle: 'Manager' }),
      employee({ id: uuid(2), country: 'IN', jobTitle: 'Designer' }),
      employee({ id: uuid(3), country: 'IN', jobTitle: 'Engineer' }),
    ]);

    const result = await service.getByTitleInCountry('IN');

    expect(result.map((r) => r.jobTitle)).toEqual(['Designer', 'Engineer', 'Manager']);
  });
});

describe('InsightsService.getOverview', () => {
  it('reports zeros for an empty repo', async () => {
    const service = await buildService([]);

    expect(await service.getOverview()).toEqual({
      totalCount: 0,
      countriesRepresented: 0,
      jobTitlesRepresented: 0,
      topCountriesByHeadcount: [],
      topJobTitlesByHeadcount: [],
    });
  });

  it('counts total, distinct countries, and distinct titles', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN', jobTitle: 'Engineer' }),
      employee({ id: uuid(2), country: 'IN', jobTitle: 'Engineer' }),
      employee({ id: uuid(3), country: 'US', jobTitle: 'Designer' }),
    ]);

    const overview = await service.getOverview();

    expect(overview.totalCount).toBe(3);
    expect(overview.countriesRepresented).toBe(2);
    expect(overview.jobTitlesRepresented).toBe(2);
  });

  it('orders top countries by headcount (desc), then by name', async () => {
    const service = await buildService([
      employee({ id: uuid(1), country: 'IN' }),
      employee({ id: uuid(2), country: 'IN' }),
      employee({ id: uuid(3), country: 'IN' }),
      employee({ id: uuid(4), country: 'US' }),
      employee({ id: uuid(5), country: 'US' }),
      employee({ id: uuid(6), country: 'DE' }),
    ]);

    const overview = await service.getOverview();

    expect(overview.topCountriesByHeadcount).toEqual([
      { country: 'IN', count: 3 },
      { country: 'US', count: 2 },
      { country: 'DE', count: 1 },
    ]);
  });

  it('caps top countries at 10', async () => {
    const lots: Employee[] = [];
    for (let i = 0; i < 15; i += 1) {
      lots.push(employee({ id: uuid(i), country: `C${String.fromCharCode(65 + i)}` }));
    }
    const service = await buildService(lots);

    const overview = await service.getOverview();

    expect(overview.topCountriesByHeadcount).toHaveLength(10);
  });

  it('orders top job titles by headcount (desc)', async () => {
    const service = await buildService([
      employee({ id: uuid(1), jobTitle: 'Engineer' }),
      employee({ id: uuid(2), jobTitle: 'Engineer' }),
      employee({ id: uuid(3), jobTitle: 'Designer' }),
    ]);

    const overview = await service.getOverview();

    expect(overview.topJobTitlesByHeadcount).toEqual([
      { jobTitle: 'Engineer', count: 2 },
      { jobTitle: 'Designer', count: 1 },
    ]);
  });
});
