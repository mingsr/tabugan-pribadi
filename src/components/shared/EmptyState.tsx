import * as React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'gradient' | 'secondary' | 'outline'
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
}

/**
 * EmptyState — dipakai di semua halaman berlist (Transaksi kosong, Riwayat
 * kosong, Achievement belum ada, Hall of Fame kosong, dst.) sesuai Component
 * Mapping §5. Ikon besar dari Lucide dipakai sebagai "ilustrasi" ringan,
 * bukan gambar raster, supaya tetap konsisten dengan Design Token (tidak ada
 * elemen visual di luar sistem warna biru/ungu yang sudah ditetapkan).
 */
function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-white/10 px-6 py-16 text-center',
        className,
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15 text-primary"
      >
        <Icon className="size-8" strokeWidth={1.5} />
      </motion.div>

      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <Button variant={action.variant ?? 'gradient'} size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
