import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogIn, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { parseErrorMessage } from '@/api/errors'
import { useLogin } from '@/hooks/useAuth'
import { useAuthContext } from '@/features/auth/context/AuthContext'
import { PasswordInput } from '@/features/auth/components/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const REMEMBERED_USERNAME_KEY = 'nabung:remembered-username'

interface FormErrors {
  username?: string
  password?: string
}

/**
 * LoginForm — logic + UI form login.
 *
 * Validasi: username & password wajib diisi (client-side, sebelum request
 * dikirim — menghemat 1 round-trip untuk kasus paling umum). Validasi
 * kredensial sesungguhnya (username/password salah) tetap sepenuhnya di
 * backend, ditampilkan sebagai error dari `useLogin()`.
 *
 * "Remember Login": murni UX (pre-fill username kunjungan berikutnya),
 * TIDAK mengubah mekanisme penyimpanan token itu sendiri (tetap
 * localStorage apa adanya, sesuai instruksi "jangan ubah mekanisme
 * autentikasi") — lihat catatan lengkap di laporan akhir Tahap 3.4.
 */
export function LoginForm() {
  const navigate = useNavigate()
  const { setAuthenticated } = useAuthContext()
  const loginMutation = useLogin()

  const [username, setUsername] = useState(() => storage.getItem(REMEMBERED_USERNAME_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [rememberLogin, setRememberLogin] = useState(
    () => storage.getItem(REMEMBERED_USERNAME_KEY) !== null,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const nextErrors: FormErrors = {}
    if (!username.trim()) nextErrors.username = 'Username wajib diisi.'
    if (!password) nextErrors.password = 'Password wajib diisi.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Prevent double submit — tombol sudah disabled saat pending, ini lapis kedua.
    if (loginMutation.isPending) return
    if (!validate()) return

    try {
      await loginMutation.mutateAsync({ username: username.trim(), password })

      if (rememberLogin) {
        storage.setItem(REMEMBERED_USERNAME_KEY, username.trim())
      } else {
        storage.removeItem(REMEMBERED_USERNAME_KEY)
      }

      setAuthenticated(username.trim())
      navigate('/', { replace: true })
    } catch {
      // Toast error sudah ditampilkan oleh onError di useLogin(); di sini cukup
      // biarkan form tetap terisi supaya pengguna bisa langsung koreksi.
    }
  }

  const isPending = loginMutation.isPending
  const submitError = loginMutation.isError ? parseErrorMessage(loginMutation.error) : null

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-username" className="text-xs font-medium text-muted-foreground">
          Username
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-username"
            name="username"
            autoComplete="username"
            placeholder="Masukkan username"
            className="pl-9"
            invalid={Boolean(errors.username)}
            value={username}
            disabled={isPending}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
            }}
          />
        </div>
        {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">
          Password
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          invalid={Boolean(errors.password)}
          value={password}
          disabled={isPending}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
          }}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
        <input
          type="checkbox"
          checked={rememberLogin}
          disabled={isPending}
          onChange={(e) => setRememberLogin(e.target.checked)}
          className={cn(
            'size-4 rounded border-input bg-background-elevated/60 accent-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        />
        Ingat login saya
      </label>

      {submitError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {submitError}
        </motion.p>
      )}

      <Button type="submit" variant="gradient" size="lg" disabled={isPending} className="mt-1">
        {isPending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Masuk...
          </>
        ) : (
          <>
            <LogIn />
            Masuk
          </>
        )}
      </Button>
    </form>
  )
}
