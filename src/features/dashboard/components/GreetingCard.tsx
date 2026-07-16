import { motion } from 'framer-motion'

import { tokenManager } from '@/lib/token'
import { formatDateLong, greetingByHour } from '@/lib/format'

/**
 * GreetingCard — Sapaan berdasarkan jam + nama pengguna + hari & tanggal.
 * Username diambil dari `tokenManager` (disimpan saat login/validateToken
 * di Tahap 3.4) — TIDAK memanggil API baru.
 */
export function GreetingCard() {
  const username = tokenManager.getUsername()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-1"
    >
      <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
        {greetingByHour()}
        {username ? `, ${username}` : ''} 👋
      </h2>
      <p className="text-sm text-muted-foreground">{formatDateLong(new Date())}</p>
    </motion.div>
  )
}
