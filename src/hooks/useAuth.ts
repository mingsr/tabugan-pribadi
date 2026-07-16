import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'
import { parseErrorMessage } from '@/api/errors'
import type { ChangePasswordInput, LoginCredentials } from '@/types/auth'

/**
 * hooks/useAuth.ts — Hook Layer untuk action #1–3 (login, validateToken, changePassword).
 *
 * Belum ada `AuthContext` di sini (itu Tahap 5 - Authentication) — hook ini
 * murni membungkus authService dengan TanStack Query, siap dipakai oleh
 * `AuthContext`/`LoginPage` nanti tanpa perlu menulis ulang logic fetching.
 */

/** Login. Sukses → invalidate SEMUA cache (data lama, jika ada, sudah tidak relevan untuk user baru). */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Berhasil masuk')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

/**
 * Validasi token tersimpan. `enabled` otomatis mengikuti keberadaan token
 * (tidak perlu memanggil backend bila memang belum ada token sama sekali).
 */
export function useValidateToken() {
  return useQuery({
    queryKey: queryKeys.auth.validate(),
    queryFn: () => authService.validateToken(),
    enabled: tokenManager.hasToken(),
    retry: false, // token invalid tidak akan jadi valid dengan diulang
  })
}

/** Ganti password — TIDAK invalidate query lain (tidak ada data yang terpengaruh). */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authService.changePassword(input),
    onSuccess: (response) => {
      toast.success(response.message || 'Password berhasil diubah')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

/** Logout — operasi lokal murni (hapus token) + bersihkan seluruh cache TanStack Query. */
export function useLogout() {
  const queryClient = useQueryClient()

  return () => {
    authService.logout()
    queryClient.clear()
  }
}
