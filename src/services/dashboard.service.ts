import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type { DashboardData, GetQuoteResponse } from '@/types/dashboard'

/**
 * services/dashboard.service.ts — action #4 (getDashboard) & #15 (getQuote), sesuai §7.
 */

async function getDashboard(): Promise<DashboardData> {
  return callApi<DashboardData>(ACTIONS.GET_DASHBOARD)
}

/** Quote harian — action terpisah dari getDashboard (mis. untuk tombol "quote lain"). */
async function getQuote(): Promise<GetQuoteResponse> {
  return callApi<GetQuoteResponse>(ACTIONS.GET_QUOTE)
}

export const dashboardService = {
  getDashboard,
  getQuote,
}
