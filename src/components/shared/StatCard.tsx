import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export interface StatCardProps {
  icon: LucideIcon
  label: string
  /** Nilai yang sudah diformat (string) ATAU node kustom (mis. `<AnimatedNumber />`). */
  value: ReactNode
  /** Warna aksen ikon — default 'primary'. */
  accent?: 'primary' | 'accent' | 'success' | 'danger' | 'warning'
  /** Teks kecil tambahan di bawah value, mis. "30 hari terakhir". */
  helperText?: string
  className?: string
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
}

/**
 * StatCard — kartu statistik generik & reusable (§4 Reusable Component).
 * Dipakai Dashboard (Ringkasan Keuangan) dan nanti Statistik (Tahap 3.10).
 * Hover animation (translate + shadow) mengikuti §6.6 (200–300ms).
 */
export function StatCard({ icon: Icon, label, value, accent = 'primary', helperText, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      <Card className="h-full transition-shadow duration-200 hover:shadow-[0_12px_32px_-8px_hsl(212_100%_55%/0.3)]">
        <CardContent className="flex items-start gap-3 p-5">
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accentClasses[accent])}>
            <Icon className="size-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="font-heading text-lg font-semibold text-foreground font-tabular">
              {value}
            </div>
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
