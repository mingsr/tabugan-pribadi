import { TX_TYPE_META } from '@/lib/transaction-meta'
import { formatDateLong, formatDateShort, rp } from '@/lib/format'
import type { TxType } from '@/types/transaction'

interface CategoryBadgeProps {
  tipe: TxType
  kategori: string
}

/** CategoryBadge — ikon + label tipe transaksi + nama kategori. */
export function CategoryBadge({ tipe, kategori }: CategoryBadgeProps) {
  const meta = TX_TYPE_META[tipe]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.accentClass}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{kategori}</span>
        <span className="text-xs text-muted-foreground">{meta.label}</span>
      </div>
    </div>
  )
}

interface AmountCellProps {
  tipe: TxType
  nominal: number
  className?: string
}

/** AmountCell — nominal dengan tanda +/- dan warna sesuai tipe transaksi. */
export function AmountCell({ tipe, nominal, className }: AmountCellProps) {
  const meta = TX_TYPE_META[tipe]
  return (
    <span className={`font-tabular font-semibold ${meta.amountClass} ${className ?? ''}`}>
      {meta.sign > 0 ? '+' : '-'}
      {rp(nominal)}
    </span>
  )
}

interface DateCellProps {
  isoDate: string
  /** 'short' (mis. "14 Jul") atau 'long' (mis. "Selasa, 14 Juli 2026"). Default 'short'. */
  variant?: 'short' | 'long'
}

/** DateCell — format tanggal konsisten untuk tabel/kartu transaksi. */
export function DateCell({ isoDate, variant = 'short' }: DateCellProps) {
  return <span>{variant === 'long' ? formatDateLong(isoDate) : formatDateShort(isoDate)}</span>
}
