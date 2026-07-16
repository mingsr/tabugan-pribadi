import { buildStableQueryParam } from '@/lib/helpers'
import type { GetTransactionsRequest } from '@/types/transaction'
import type { GetMonthlyStatRequest, GetMonthlyTrendRequest } from '@/types/statistics'

/**
 * lib/query-keys.ts — Query Key Factory terpusat.
 *
 * Satu sumber kebenaran untuk seluruh query key TanStack Query, mengikuti
 * konvensi contoh di §10 State Management. Dipakai bersama oleh
 * hooks/use*.ts (untuk useQuery) dan services/*.service.ts / hooks mutation
 * (untuk `queryClient.invalidateQueries`), supaya tidak ada key yang
 * ditulis manual berulang-ulang (rawan typo/tidak konsisten).
 */
export const queryKeys = {
  auth: {
    validate: () => ['auth', 'validate'] as const,
  },
  dashboard: {
    root: () => ['dashboard'] as const,
  },
  quote: {
    root: () => ['quote'] as const,
  },
  transactions: {
    root: () => ['transactions'] as const,
    list: (filters: GetTransactionsRequest = {}) =>
      ['transactions', buildStableQueryParam(filters)] as const,
  },
  wishlist: {
    root: () => ['wishlist'] as const,
  },
  hallOfFame: {
    root: () => ['hall-of-fame'] as const,
  },
  achievements: {
    root: () => ['achievements'] as const,
  },
  statistics: {
    monthly: (params: GetMonthlyStatRequest = {}) =>
      ['monthly-stat', buildStableQueryParam(params)] as const,
    trend: (params: GetMonthlyTrendRequest = {}) =>
      ['monthly-trend', buildStableQueryParam(params)] as const,
  },
} as const
