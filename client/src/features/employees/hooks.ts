import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  getEmployeeFilterMeta,
  listEmployees,
  type ListEmployeesParams,
} from '../../lib/api';

export const employeesQueryKey = (params: ListEmployeesParams) =>
  ['employees', 'list', params] as const;

export const employeeMetaQueryKey = ['employees', 'meta'] as const;

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

/**
 * Distinct countries + job titles for filter dropdowns. Long staleTime
 * because the set changes only when employees are added with novel
 * values — the rest of the time it's effectively static.
 */
export const useEmployeeFilterMetaQuery = () =>
  useQuery({
    queryKey: employeeMetaQueryKey,
    queryFn: getEmployeeFilterMeta,
    staleTime: 5 * 60_000,
  });

/**
 * Create-employee mutation. On success, invalidates both the list and
 * the meta caches so a freshly-added country / title appears in the
 * filter dropdowns without a manual refresh.
 */
export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
