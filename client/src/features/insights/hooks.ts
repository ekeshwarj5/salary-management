import { useQuery } from '@tanstack/react-query';
import {
  getInsightsByCountry,
  getInsightsByTitleInCountry,
  getOverview,
} from '../../lib/api';

export const useOverviewQuery = () =>
  useQuery({
    queryKey: ['insights', 'overview'] as const,
    queryFn: getOverview,
    staleTime: 60_000,
  });

export const useInsightsByCountryQuery = () =>
  useQuery({
    queryKey: ['insights', 'by-country'] as const,
    queryFn: getInsightsByCountry,
    staleTime: 60_000,
  });

export const useInsightsByTitleInCountryQuery = (country: string) =>
  useQuery({
    queryKey: ['insights', 'by-title', country] as const,
    queryFn: () => getInsightsByTitleInCountry(country),
    enabled: country !== '',
    staleTime: 60_000,
  });
