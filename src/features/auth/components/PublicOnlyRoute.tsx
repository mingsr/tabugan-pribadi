import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthContext } from '@/features/auth/context/AuthContext'
import { Loading } from '@/components/ui/loading'

interface PublicOnlyRouteProps {
  children: ReactNode
}

/**
 * PublicOnlyRoute — kebalikan dari `RequireAuth`.
 * Dipakai membungkus `/login` supaya pengguna yang sudah authenticated
 * (mis. buka tab baru ke /login secara langsung) diarahkan kembali ke `/`,
 * bukan melihat form login lagi.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { status } = useAuthContext()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading size="lg" label="Memeriksa sesi login..." />
      </div>
    )
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
