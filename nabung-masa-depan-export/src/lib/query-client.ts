import { QueryClient } from '@tanstack/react-query'

/**
 * Instance QueryClient tunggal untuk seluruh aplikasi.
 *
 * `queryKeys` per-fitur (mis. ['dashboard'], ['transactions', filter], dst.)
 * akan ditambahkan bertahap di masing-masing `features/*\/api.ts` pada
 * Tahap 3.3 (API Layer & Service Layer) dan seterusnya — file ini HANYA
 * berisi konfigurasi client, belum ada query/mutation apa pun.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Backend (Apps Script) relatif lambat & berbasis kuota Google —
      // hindari refetch agresif secara default.
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
})
