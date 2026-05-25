import type {
  CountrySalaryInsight,
  CreateEmployee,
  Employee,
  OverviewInsight,
  TitleSalaryInsight,
  UpdateEmployee,
} from '@salary/shared';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export interface ListEmployeesResponse {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListEmployeesParams {
  page?: number;
  pageSize?: number;
  country?: string;
  jobTitle?: string;
  search?: string;
}

export interface ValidationIssue {
  path: Array<string | number>;
  message: string;
  code?: string;
}

/**
 * Thrown for any non-2xx response. Carries the server's error body so
 * forms can render per-field issues without re-fetching.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: {
      error?: string;
      message?: string;
      issues?: ValidationIssue[];
    },
  ) {
    super(body.message ?? body.error ?? `Request failed with ${statusCode}`);
    this.name = 'ApiError';
  }
}

const buildQuery = (params: object): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : '';
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

// Employees ------------------------------------------------------------

export const listEmployees = (params: ListEmployeesParams = {}) =>
  request<ListEmployeesResponse>(`/employees${buildQuery(params)}`);

export const getEmployee = (id: string) => request<Employee>(`/employees/${id}`);

export const createEmployee = (input: CreateEmployee) =>
  request<Employee>('/employees', { method: 'POST', body: JSON.stringify(input) });

export const updateEmployee = (id: string, patch: UpdateEmployee) =>
  request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

export const deleteEmployee = (id: string) =>
  request<void>(`/employees/${id}`, { method: 'DELETE' });

// Insights -------------------------------------------------------------

export const getOverview = () => request<OverviewInsight>('/insights/overview');

export const getInsightsByCountry = () =>
  request<CountrySalaryInsight[]>('/insights/by-country');

export const getInsightsByTitleInCountry = (country: string) =>
  request<TitleSalaryInsight[]>(`/insights/by-title${buildQuery({ country })}`);
