import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { wishlistService } from '@/services/wishlist.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'
import { parseErrorMessage } from '@/api/errors'
import type { CreateWishlistRequest, UpdateWishlistRequest } from '@/types/wishlist'

/**
 * hooks/useWishlist.ts — Hook Layer untuk action #9–13.
 *
 * `useHallOfFame` disertakan di file ini (bukan `useHallOfFame.ts`
 * terpisah) mengikuti keputusan yang sama di services/wishlist.service.ts
 * — lihat catatan di file tersebut.
 */

export function useWishlist() {
  return useQuery({
    queryKey: queryKeys.wishlist.root(),
    queryFn: () => wishlistService.getTarget(),
    enabled: tokenManager.hasToken(),
  })
}

export function useHallOfFame() {
  return useQuery({
    queryKey: queryKeys.hallOfFame.root(),
    queryFn: () => wishlistService.getHallOfFame(),
    enabled: tokenManager.hasToken(),
  })
}

function useInvalidateAfterWishlistChange() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() })
  }
}

export function useCreateWishlist() {
  const invalidate = useInvalidateAfterWishlistChange()

  return useMutation({
    mutationFn: (request: CreateWishlistRequest) => wishlistService.createTarget(request),
    onSuccess: (response) => {
      invalidate()
      toast.success(response.message || 'Wishlist berhasil dibuat')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

export function useUpdateWishlist() {
  const invalidate = useInvalidateAfterWishlistChange()

  return useMutation({
    mutationFn: (request: UpdateWishlistRequest) => wishlistService.updateTarget(request),
    onSuccess: (response) => {
      invalidate()
      toast.success(response.message || 'Wishlist berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

export function useCompleteWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => wishlistService.completeTarget(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() })
      queryClient.invalidateQueries({ queryKey: queryKeys.hallOfFame.root() })
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements.root() })
      toast.success(response.message || 'Selamat! Wishlist tercapai 🎉')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}
