import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage'
import { HistoryPage } from '@/features/history/pages/HistoryPage'
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage'

/**
 * app/router.tsx — Struktur routing dasar, sesuai §11 Routing.
 *
 * Route yang SUDAH ada di sini:
 * - `/login`      (publik, lewat `PublicOnlyRoute`)
 * - `/`           (terproteksi, `DashboardPage` — Tahap 3.5)
 * - `/transaksi`  (terproteksi, `TransactionsPage` — Tahap 3.6, CRUD)
 * - `/riwayat`    (terproteksi, `HistoryPage` — Tahap 3.6, read-only)
 * - `/wishlist`   (terproteksi, `WishlistPage` — Tahap 3.7)
 * - `*`           → redirect ke `/`
 *
 * 6 route fitur lain (achievement, statistik, dst. — lihat §11) SENGAJA
 * BELUM ditambahkan, menyusul satu per satu bersamaan halamannya
 * masing-masing dibangun (Tahap 3.8+).
 */

/**
 * Layout untuk seluruh route terproteksi: RequireAuth membungkus AppShell.
 * FAB mobile ("+ Tambah Transaksi") menavigasi ke `/transaksi` dengan
 * `location.state.openAddDialog`, dibaca oleh `TransactionsPage` untuk
 * langsung membuka `TransactionFormDialog` — bukan lagi toast placeholder
 * sejak Modul Keuangan ada (Tahap 3.6).
 */
function ProtectedLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <RequireAuth>
      <AppShell onFabClick={() => navigate('/transaksi', { state: { openAddDialog: true } })}>
        {children}
      </AppShell>
    </RequireAuth>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/transaksi"
        element={
          <ProtectedLayout>
            <TransactionsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/riwayat"
        element={
          <ProtectedLayout>
            <HistoryPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedLayout>
            <WishlistPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
