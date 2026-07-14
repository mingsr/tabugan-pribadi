import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers — pembungkus seluruh context aplikasi.
 *
 * Sudah terpasang di Tahap 3.2 ini: QueryClientProvider, BrowserRouter
 * (dibutuhkan agar `NavLink` di Sidebar bisa mendeteksi active-state —
 * TANPA ini komponen Sidebar akan error karena butuh Router context),
 * dan `<Toaster />` global untuk notifikasi Sonner.
 *
 * BELUM ditambahkan (menyusul di tahap terkait, BUKAN bagian Tahap 3.2):
 * - `<Routes>` / definisi route penuh              → Tahap 4 (Routing)
 * - `AuthProvider` + auth guard                     → Tahap 5 (Authentication)
 * - `TooltipProvider`                                → saat komponen Tooltip
 *   pertama kali benar-benar dipakai oleh sebuah fitur
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
