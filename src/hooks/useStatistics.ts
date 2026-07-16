import { useQuery } from '@tanstack/react-query'

import { statisticsService } from '@/services/statistics.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'
import type { GetMonthlyStatRequest, GetMonthlyTrendRequest } from '@/types/statistics'

/**
 * hooks/useStatistics.ts — Hook Layer untuk action #16–17.
 */

export function useMonthlyStatistics(params: GetMonthlyStatRequest = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.monthly(params),
    queryFn: () => statisticsService.getMonthlyStat(params),
    enabled: tokenManager.hasToken(),
  })
}

export function useMonthlyTrend(params: GetMonthlyTrendRequest = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.trend(params),
    queryFn: () => statisticsService.getMonthlyTrend(params),
    enabled: tokenManager.hasToken(),
  })
}
