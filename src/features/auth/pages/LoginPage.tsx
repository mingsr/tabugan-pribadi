import { motion } from 'framer-motion'
import { PiggyBank } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/components/LoginForm'

/**
 * LoginPage — sesuai §11 Routing (`/login`, public route) & §6 Design Token.
 *
 * Komponen: logo aplikasi, judul, subtitle, LoginForm (input username,
 * input password + show/hide, remember login, tombol login, loading/error
 * state) — semua di dalam Card glassmorphism di atas gradient background
 * dark blue → electric blue → neon purple.
 */
export function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Gradient background — dark blue nyaris hitam dengan glow biru/ungu lembut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 15%, hsl(212 100% 55% / 0.18), transparent 60%),' +
            'radial-gradient(55% 45% at 85% 85%, hsl(271 91% 65% / 0.16), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-base w-full max-w-md"
      >
        <Card className="p-2">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
                className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-soft)]"
              >
                <PiggyBank className="size-7" />
              </motion.div>

              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  Nabung Untuk Masa Depan
                </h1>
                <p className="text-sm text-muted-foreground">
                  Masuk untuk melanjutkan progres tabunganmu
                </p>
              </div>
            </div>

            <LoginForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
