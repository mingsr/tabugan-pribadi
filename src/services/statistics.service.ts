import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type {
  GetMonthlyStatRequest,
  GetMonthlyTrendRequest,
  GetMonthlyTrendResponse,
  MonthlyStat,
} from '@/types/statistics'

/**
 * services/statistics.service.ts — action #16–17 (§7): getMonthlyStat, getMonthlyTrend.
 */

async function getMonthlyStat(params: GetMonthlyStatRequest = {}): Promise<MonthlyStat> {
  return callApi<MonthlyStat, GetMonthlyStatRequest>(ACTIONS.GET_MONTHLY_STAT, params)
}

async function getMonthlyTrend(
  params: GetMonthlyTrendRequest = {},
): Promise<GetMonthlyTrendResponse> {
  return callApi<GetMonthlyTrendResponse, GetMonthlyTrendRequest>(
    ACTIONS.GET_MONTHLY_TREND,
    params,
  )
}

export const statisticsService = {
  getMonthlyStat,
  getMonthlyTrend,
}
