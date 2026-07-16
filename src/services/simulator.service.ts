import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type { SimulateTargetRequest, SimulateTargetResponse } from '@/types/simulator'

/**
 * services/simulator.service.ts — action #18 (§7): simulateTarget.
 *
 * Dipanggil on-demand saat pengguna submit form simulator (bukan data yang
 * di-cache/di-refetch pasif) — lihat hooks/useSimulator.ts yang
 * membungkusnya sebagai `useMutation`, bukan `useQuery`.
 */

async function simulateTarget(request: SimulateTargetRequest): Promise<SimulateTargetResponse> {
  return callApi<SimulateTargetResponse, SimulateTargetRequest>(ACTIONS.SIMULATE_TARGET, request)
}

export const simulatorService = {
  simulateTarget,
}
