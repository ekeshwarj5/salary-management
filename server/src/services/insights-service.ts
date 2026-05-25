import type { Employee } from '@salary/shared';
import type { EmployeeRepository } from './employee-service';

export interface CountrySalaryInsight {
  country: string;
  currency: string;
  count: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
}

export interface TitleSalaryInsight {
  country: string;
  jobTitle: string;
  currency: string;
  count: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
}

const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
const avg = (xs: number[]): number => (xs.length === 0 ? 0 : sum(xs) / xs.length);

/**
 * Sample median. Robust to outliers, more meaningful than the mean for
 * salary data which is typically right-skewed. Returns 0 for empty input
 * (callers never pass empty groups in practice; the guard is defensive).
 */
const median = (xs: number[]): number => {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
};

const groupBy = <T, K extends string>(items: T[], key: (item: T) => K): Map<K, T[]> => {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const existing = groups.get(k);
    if (existing) existing.push(item);
    else groups.set(k, [item]);
  }
  return groups;
};

const salaryAggregates = (employees: Employee[]) => {
  const salaries = employees.map((e) => e.salary);
  return {
    count: salaries.length,
    minSalary: Math.min(...salaries),
    maxSalary: Math.max(...salaries),
    avgSalary: avg(salaries),
    medianSalary: median(salaries),
  };
};

export class InsightsService {
  constructor(private readonly repo: EmployeeRepository) {}

  /**
   * Salary aggregates grouped by (country, currency). Most countries map
   * to a single currency, in which case there is one entry per country;
   * if an organisation pays expats in a different currency, the breakdown
   * surfaces it instead of producing a meaningless cross-currency average.
   */
  async getByCountry(): Promise<CountrySalaryInsight[]> {
    const all = await this.repo.findAll();
    const groups = groupBy(all, (e) => `${e.country}::${e.currency}`);
    const result: CountrySalaryInsight[] = [];
    for (const employees of groups.values()) {
      const head = employees[0]!;
      result.push({
        country: head.country,
        currency: head.currency,
        ...salaryAggregates(employees),
      });
    }
    return result.sort(
      (a, b) =>
        a.country.localeCompare(b.country) || a.currency.localeCompare(b.currency),
    );
  }

  /**
   * Salary aggregates per job title within a single country, broken out
   * by currency. Empty list when no employees match the country.
   */
  async getByTitleInCountry(country: string): Promise<TitleSalaryInsight[]> {
    const all = await this.repo.findAll();
    const inCountry = all.filter((e) => e.country === country);
    const groups = groupBy(inCountry, (e) => `${e.jobTitle}::${e.currency}`);
    const result: TitleSalaryInsight[] = [];
    for (const employees of groups.values()) {
      const head = employees[0]!;
      result.push({
        country,
        jobTitle: head.jobTitle,
        currency: head.currency,
        ...salaryAggregates(employees),
      });
    }
    return result.sort(
      (a, b) =>
        a.jobTitle.localeCompare(b.jobTitle) || a.currency.localeCompare(b.currency),
    );
  }
}
