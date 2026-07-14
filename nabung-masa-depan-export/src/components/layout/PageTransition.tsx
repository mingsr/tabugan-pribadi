import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
  /** Dipakai sebagai key AnimatePresence oleh pemanggil (biasanya pathname route) */
  transitionKey?: string
}

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/**
 * PageTransition — wrapper generik fade+slide (250ms, easeOut) sesuai §6.6.
 *
 * Komponen ini murni "kotak animasi" yang bisa dipakai untuk konten apa pun
 * (termasuk konten demo/preview di Tahap 3.2 ini). Pemasangannya di sekitar
 * `<Outlet />` react-router — lengkap dengan AnimatePresence pada level
 * router — baru dilakukan di Tahap 4 (Routing), sesuai roadmap.
 */
export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  return (
    <motion.div
      key={transitionKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
