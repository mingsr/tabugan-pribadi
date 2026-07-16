import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

interface MobileFabProps {
  onClick: () => void
  label?: string
  className?: string
}

/**
 * MobileFab — tombol apung "+ Tambah Transaksi", HANYA tampil di breakpoint
 * mobile (<768px), sesuai Master Prompt §2 & Component Mapping §4.
 *
 * `onClick` sengaja diterima sebagai prop wajib dari pemanggil (AppShell) —
 * komponen ini murni presentasi, belum terhubung ke
 * `TransactionFormDialog` sungguhan karena fitur Transaksi baru dibangun
 * di tahap selanjutnya (bukan bagian dari Tahap 3.2 — Design System & Layout).
 */
export function MobileFab({ onClick, label = 'Tambah Transaksi', className }: MobileFabProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'fixed bottom-6 right-5 z-fab flex items-center gap-2 rounded-full',
        'bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-white',
        'shadow-[0_10px_30px_-6px_hsl(212_100%_55%/0.5)]',
        'transition-shadow duration-200 hover:shadow-[0_14px_36px_-6px_hsl(212_100%_55%/0.6)]',
        className,
      )}
      aria-label={label}
    >
      <Plus className="size-5" strokeWidth={2.5} />
      <span>{label}</span>
    </motion.button>
  )
}
