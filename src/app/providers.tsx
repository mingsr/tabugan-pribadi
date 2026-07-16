import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/features/auth/context/AuthContext'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers — pembungkus seluruh context aplikasi.
 *
 * Urutan penting: QueryClientProvider paling luar (AuthProvider memakai
 * `useQueryClient` untuk `queryClient.clear()` saat logout/auto-logout),
 * lalu BrowserRouter (dibutuhkan NavLink di Sidebar & `useNavigate`/
 * `<Navigate>` di RequireAuth/PublicOnlyRoute), lalu AuthProvider
 * (menyediakan status login ke seluruh pohon, termasuk `AppRouter`).
 *
 * Ditambahkan di Tahap 3.4 ini: `AuthProvider`.
 * BELUM ditambahkan (menyusul, BUKAN bagian Tahap 3.4):
 * - `TooltipProvider` → saat komponen Tooltip pertama kali benar-benar
 *   dipakai oleh sebuah fitur
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
