import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarGradientProps {
  /** 0–100 */
  value: number
  /** Label kiri, mis. "Progress" atau nama wishlist. */
  label?: string
  /** Tampilkan angka persen di kanan label. Default true. */
  showPercentLabel?: boolean
  className?: string
}

/**
 * ProgressBarGradient — wrapper di atas `components/ui/progress.tsx` dengan
 * label persen, dipakai Dashboard (Wishlist Aktif) & fitur Wishlist penuh
 * (Tahap 3.7) — satu implementasi, tidak diduplikasi (§4/§5).
 */
export function ProgressBarGradient({
  value,
  label,
  showPercentLabel = true,
  className,
}: ProgressBarGradientProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showPercentLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-muted-foreground">{label}</span>}
          {showPercentLabel && (
            <span className="font-tabular font-semibold text-foreground">
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <Progress value={clamped} />
    </div>
  )
}
