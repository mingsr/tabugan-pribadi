import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthContext } from '@/features/auth/context/AuthContext'
import { Loading } from '@/components/ui/loading'

interface RequireAuthProps {
  children: ReactNode
}

/**
 * RequireAuth — Auth Guard, sesuai §11 Routing.
 *
 * - `checking`       → full-page Loading (validasi token sedang berjalan)
 * - `unauthenticated` → redirect ke /login
 * - `authenticated`   → render children (AppShell + Outlet)
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuthContext()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading size="lg" label="Memeriksa sesi login..." />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
