import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { authService } from '@/services/auth.service'
import { tokenManager } from '@/lib/token'

/**
 * features/auth/context/AuthContext.tsx
 *
 * Satu sumber kebenaran untuk "apakah pengguna sedang login" di seluruh
 * aplikasi (§10 State Management: "Auth state (token, username) → React
 * Context + localStorage"). Tanggung jawabnya HANYA status auth di memori
 * React — penyimpanan token sesungguhnya tetap di `lib/token.ts`
 * (mekanisme tidak diubah).
 *
 * Alur:
 * 1. AUTO-LOGIN saat mount: bila ada token tersimpan, validasi ke backend
 *    (`validateToken`) SEKALI. Valid → status 'authenticated'. Tidak valid
 *    → token dibersihkan, status 'unauthenticated'.
 * 2. AUTO-LOGOUT reaktif: subscribe ke `tokenManager.subscribeToTokenChanges`.
 *    Bila token hilang karena 'expired' (ditolak backend di request lain)
 *    atau 'cross-tab' (logout di tab lain) → status jadi 'unauthenticated'
 *    + toast "Sesi berakhir". Reason 'manual' (logout eksplisit) TIDAK
 *    menampilkan toast tsb karena sudah ditangani jalur `logout()` di bawah.
 */

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  username: string | null
  isAuthenticated: boolean
  isChecking: boolean
  /** Dipanggil LoginForm setelah `useLogin()` mutation sukses. */
  setAuthenticated: (username: string) => void
  /** Logout eksplisit (dipicu pengguna, mis. tombol Logout). */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenManager.hasToken() ? 'checking' : 'unauthenticated',
  )
  const [username, setUsernameState] = useState<string | null>(() => tokenManager.getUsername())

  // ── Auto-login: validasi token tersimpan SEKALI saat mount ───────────
  useEffect(() => {
    let cancelled = false

    if (!tokenManager.hasToken()) {
      setStatus('unauthenticated')
      return
    }

    setStatus('checking')

    authService
      .validateToken()
      .then((result) => {
        if (cancelled) return
        if (result.valid) {
          tokenManager.setUsername(result.username)
          setUsernameState(result.username)
          setStatus('authenticated')
        } else {
          tokenManager.clearToken('expired')
          setStatus('unauthenticated')
        }
      })
      .catch(() => {
        if (cancelled) return
        tokenManager.clearToken('expired')
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
    // Sengaja hanya jalan sekali saat mount (setara `initApp()` lama) —
    // bukan setiap kali `status`/`username` berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-logout reaktif (token hilang karena expired atau tab lain) ──
  useEffect(() => {
    return tokenManager.subscribeToTokenChanges((event) => {
      if (event.type === 'expired' || event.type === 'cross-tab') {
        setStatus((prev) => {
          if (prev === 'authenticated') {
            toast.error('Sesi berakhir, silakan login kembali.')
          }
          return 'unauthenticated'
        })
        setUsernameState(null)
        queryClient.clear()
      }
    })
  }, [queryClient])

  const setAuthenticated = useCallback((nextUsername: string) => {
    setUsernameState(nextUsername)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    authService.logout() // reason: 'manual' — lihat auth.service.ts
    queryClient.clear()
    setUsernameState(null)
    setStatus('unauthenticated')
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      username,
      isAuthenticated: status === 'authenticated',
      isChecking: status === 'checking',
      setAuthenticated,
      logout,
    }),
    [status, username, setAuthenticated, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook konsumsi AuthContext — melempar error jelas bila dipakai di luar provider. */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext harus dipakai di dalam <AuthProvider>.')
  }
  return ctx
}
