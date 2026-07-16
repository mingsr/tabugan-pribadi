import { ProgressBarGradient } from '@/components/shared/ProgressBarGradient'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { rp } from '@/lib/format'
import { ProgressInfo } from '@/features/wishlist/components/ProgressInfo'
import type { Wishlist } from '@/types/wishlist'

interface WishlistProgressProps {
  wishlist: Wishlist
}

/**
 * WishlistProgress — "Progress Card": Animated Progress Bar, persentase,
 * nominal progress (saldo saat ini), dan sisa dana. Seluruh angka dari
 * `Wishlist` (§8) — TIDAK ada kalkulasi ulang di frontend (`persen`,
 * `kurang` sudah dihitung backend).
 */
export function WishlistProgress({ wishlist }: WishlistProgressProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProgressBarGradient value={wishlist.persen} label="Progress" />

      <div className="grid grid-cols-3 gap-3">
        <ProgressInfo
          label="Terkumpul"
          value={rp(wishlist.total_saving)}
        />
        <ProgressInfo
          label="Persentase"
          value={`${wishlist.persen.toFixed(0)}%`}
        />
        <ProgressInfo label="Sisa Dana" value={rp(wishlist.kurang)} align="right" />
      </div>

      {/* Angka besar beranimasi count-up untuk persentase, aksen visual utama kartu ini */}
      <div className="flex items-baseline gap-1 self-center">
        <span className="font-heading text-3xl font-bold text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
          <AnimatedNumber value={wishlist.persen} format={(v) => v.toFixed(0)} />
        </span>
        <span className="font-heading text-xl font-bold text-accent">%</span>
      </div>
    </div>
  )
}
