import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { CreateEmployee } from '@salary/shared';
import { buildApp } from '../../src/app';
import { EmployeeService } from '../../src/services/employee-service';
import { InsightsService } from '../../src/services/insights-service';
import { InMemoryEmployeeRepository } from '../../src/repositories/in-memory-employee-repository';

const sequentialIds = () => {
  let counter = 0;
  return () => {
    counter += 1;
    return `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`;
  };
};

const validPayload: CreateEmployee = {
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
  email: 'jane.doe@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
};

describe('Insights routes', () => {
  let app: FastifyInstance;

  const seed = async (overrides: Partial<CreateEmployee>) =>
    (
      await app.inject({
        method: 'POST',
        url: '/employees',
        payload: { ...validPayload, ...overrides },
      })
    ).json();

  beforeEach(async () => {
    const repo = new InMemoryEmployeeRepository();
    const employees = new EmployeeService(repo, sequentialIds());
    const insights = new InsightsService(repo);
    app = buildApp({ employees, insights });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /insights/by-country', () => {
    it('returns an empty array when there are no employees', async () => {
      const response = await app.inject({ method: 'GET', url: '/insights/by-country' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('returns per-country salary aggregates', async () => {
      await seed({ country: 'IN', currency: 'INR', salary: 1_000_000, email: 'a@x.com' });
      await seed({ country: 'IN', currency: 'INR', salary: 3_000_000, email: 'b@x.com' });
      await seed({ country: 'US', currency: 'USD', salary: 120_000, email: 'c@x.com' });

      const response = await app.inject({ method: 'GET', url: '/insights/by-country' });
      const body = response.json();

      expect(body).toHaveLength(2);
      const inRow = body.find((r: { country: string }) => r.country === 'IN');
      expect(inRow).toMatchObject({
        currency: 'INR',
        count: 2,
        minSalary: 1_000_000,
        maxSalary: 3_000_000,
        avgSalary: 2_000_000,
        medianSalary: 2_000_000,
      });
    });
  });

  describe('GET /insights/by-title', () => {
    it('returns 400 when the country query is missing', async () => {
      const response = await app.inject({ method: 'GET', url: '/insights/by-title' });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe('ValidationError');
    });

    it('returns 400 when the country query is malformed', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/insights/by-title?country=usa',
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns per-title salary aggregates for the given country', async () => {
      await seed({ country: 'IN', jobTitle: 'Engineer', salary: 1_000_000, email: 'a@x.com' });
      await seed({ country: 'IN', jobTitle: 'Engineer', salary: 2_000_000, email: 'b@x.com' });
      await seed({ country: 'IN', jobTitle: 'Designer', salary: 1_500_000, email: 'c@x.com' });
      await seed({ country: 'US', jobTitle: 'Engineer', salary: 99_999, email: 'd@x.com' });

      const response = await app.inject({
        method: 'GET',
        url: '/insights/by-title?country=IN',
      });
      const body = response.json();

      expect(body).toHaveLength(2);
      const engineer = body.find((r: { jobTitle: string }) => r.jobTitle === 'Engineer');
      expect(engineer.country).toBe('IN');
      expect(engineer.avgSalary).toBe(1_500_000);
    });

    it('returns an empty array when the country has no employees', async () => {
      await seed({ country: 'IN', email: 'a@x.com' });

      const response = await app.inject({
        method: 'GET',
        url: '/insights/by-title?country=DE',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });
  });

  describe('GET /insights/overview', () => {
    it('returns zeros for an empty repo', async () => {
      const response = await app.inject({ method: 'GET', url: '/insights/overview' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        totalCount: 0,
        countriesRepresented: 0,
        jobTitlesRepresented: 0,
        topCountriesByHeadcount: [],
        topJobTitlesByHeadcount: [],
      });
    });

    it('returns headcount summary with top lists', async () => {
      await seed({ country: 'IN', jobTitle: 'Engineer', email: 'a@x.com' });
      await seed({ country: 'IN', jobTitle: 'Engineer', email: 'b@x.com' });
      await seed({ country: 'US', jobTitle: 'Designer', email: 'c@x.com' });

      const response = await app.inject({ method: 'GET', url: '/insights/overview' });
      const body = response.json();

      expect(body.totalCount).toBe(3);
      expect(body.countriesRepresented).toBe(2);
      expect(body.jobTitlesRepresented).toBe(2);
      expect(body.topCountriesByHeadcount[0]).toEqual({ country: 'IN', count: 2 });
      expect(body.topJobTitlesByHeadcount[0]).toEqual({ jobTitle: 'Engineer', count: 2 });
    });
  });
});
