import { QueryClient } from '@tanstack/react-query'

import { isAuthError, toApiError } from '@/api/errors'

/**
 * Instance QueryClient tunggal untuk seluruh aplikasi.
 *
 * Query key factory ada di `lib/query-keys.ts`. File ini HANYA konfigurasi
 * client (retry strategy, stale time, error handling default) — query dan
 * mutation sesungguhnya didefinisikan di `hooks/use*.ts` per fitur.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Backend (Apps Script) relatif lambat & berbasis kuota Google —
      // hindari refetch agresif secara default.
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      /**
       * Retry strategy: maksimal 2x percobaan ulang untuk query, TAPI
       * jangan retry sama sekali bila error adalah error otentikasi
       * (token invalid/expired) — retry tidak akan mengubah hasil dan
       * hanya membuang waktu/kuota backend.
       */
      retry: (failureCount, error) => {
        const apiError = toApiError(error)
        if (isAuthError(apiError)) return false
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    },
    mutations: {
      // Mutation TIDAK di-retry otomatis secara default — sebagian besar
      // action (addTransaction, createTarget, dst.) tidak idempotent,
      // retry otomatis berisiko duplikasi data di Google Sheets.
      retry: false,
    },
  },
})
