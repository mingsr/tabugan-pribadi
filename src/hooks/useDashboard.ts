import { useQuery } from '@tanstack/react-query'

import { dashboardService } from '@/services/dashboard.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'

/**
 * hooks/useDashboard.ts — Hook Layer untuk action #4 (getDashboard) & #15 (getQuote).
 */

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.root(),
    queryFn: () => dashboardService.getDashboard(),
    enabled: tokenManager.hasToken(),
  })
}

/** Quote terpisah — mis. tombol "quote lain" tanpa perlu refetch seluruh dashboard. */
export function useQuote() {
  return useQuery({
    queryKey: queryKeys.quote.root(),
    queryFn: () => dashboardService.getQuote(),
    enabled: tokenManager.hasToken(),
    staleTime: 0, // quote memang dimaksudkan berubah tiap kali diminta
  })
}
