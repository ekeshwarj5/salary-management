import { useQuery } from '@tanstack/react-query';
import { listEmployees, type ListEmployeesParams } from '../../lib/api';

export const employeesQueryKey = (params: ListEmployeesParams) =>
  ['employees', 'list', params] as const;

/**
 * Paginated, filtered employees list. Caller passes the normalised
 * params (page/pageSize defaults already applied) so the cache key
 * matches the API request 1:1.
 */
export const useEmployeesQuery = (params: ListEmployeesParams) =>
  useQuery({
    queryKey: employeesQueryKey(params),
    queryFn: () => listEmployees(params),
    placeholderData: (previous) => previous, // keep previous page visible while next loads
  });
