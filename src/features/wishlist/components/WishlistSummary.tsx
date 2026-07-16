import { Calendar, Target } from 'lucide-react'

import { rp, formatDateLong } from '@/lib/format'
import type { Wishlist } from '@/types/wishlist'

interface WishlistSummaryProps {
  wishlist: Wishlist
}

/**
 * WishlistSummary — info fields Active Wishlist: nama, harga target,
 * estimasi tercapai (bila tersedia dari `getDashboard`; `getTarget`
 * langsung TIDAK menyertakan `prediksi_selesai`, lihat §8 — field ini
 * `undefined` bila data berasal dari `getTarget`, ditangani dengan
 * menyembunyikan baris tsb, bukan menampilkan nilai kosong/palsu).
 */
export function WishlistSummary({ wishlist }: WishlistSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-heading text-xl font-semibold text-foreground">{wishlist.nama_target}</p>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Target className="size-3.5" />
          Target {rp(wishlist.target_nominal)}
        </div>
      </div>

      {wishlist.prediksi_selesai && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          Estimasi tercapai {formatDateLong(wishlist.prediksi_selesai)}
        </div>
      )}
    </div>
  )
}
