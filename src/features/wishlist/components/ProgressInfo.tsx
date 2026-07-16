interface ProgressInfoProps {
  label: string
  value: string
  align?: 'left' | 'right'
}

/**
 * ProgressInfo — satu pasang label/nilai kecil (mis. "Saldo Saat Ini" →
 * "Rp 1.500.000"), dipakai `WishlistProgress` untuk menampilkan nominal
 * progress & sisa dana secara konsisten. Komponen kecil & reusable sesuai
 * §5 pemisahan komponen.
 */
export function ProgressInfo({ label, value, align = 'left' }: ProgressInfoProps) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-tabular text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
