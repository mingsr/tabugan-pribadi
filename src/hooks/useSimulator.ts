import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { simulatorService } from '@/services/simulator.service'
import { queryKeys } from '@/lib/query-keys'
import { parseErrorMessage } from '@/api/errors'
import type { SimulateTargetRequest } from '@/types/simulator'

/**
 * hooks/useSimulator.ts — Hook Layer untuk action #18 (simulateTarget).
 *
 * Dibungkus `useMutation` (bukan `useQuery`) karena bersifat "hitung saat
 * diminta" oleh submit form, bukan data yang perlu di-cache/refetch pasif.
 * Response `new_achievements` (bila ada) tetap membuat achievement cache
 * usang, jadi tetap invalidate `achievements`.
 */
export function useSimulateTarget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: SimulateTargetRequest) => simulatorService.simulateTarget(request),
    onSuccess: (response) => {
      if (response.new_achievements.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.achievements.root() })
      }
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}
