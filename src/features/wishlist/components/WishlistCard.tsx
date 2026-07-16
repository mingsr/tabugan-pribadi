import { motion } from 'framer-motion'
import { CheckCircle2, Gift, Pencil } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WishlistSummary } from '@/features/wishlist/components/WishlistSummary'
import { WishlistProgress } from '@/features/wishlist/components/WishlistProgress'
import type { Wishlist } from '@/types/wishlist'

interface WishlistCardProps {
  wishlist: Wishlist
  onEdit: () => void
  onComplete: () => void
}

/**
 * WishlistCard — kartu utama Active Wishlist. Menyatukan `WishlistSummary`
 * (info fields) + `WishlistProgress` (bar & angka) + aksi (Edit,
 * Selesaikan) dalam satu Card glassmorphism, hover animation ringan sesuai
 * Design System §6.
 */
export function WishlistCard({ wishlist, onEdit, onComplete }: WishlistCardProps) {
  const isCompletable = wishlist.persen >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Wishlist Aktif</CardTitle>
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Gift className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <WishlistSummary wishlist={wishlist} />
          <WishlistProgress wishlist={wishlist} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Pencil />
              Edit
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={onComplete}
              className="flex-1"
              title={
                isCompletable
                  ? undefined
                  : 'Belum mencapai 100%, tapi tetap bisa diselesaikan bila diinginkan'
              }
            >
              <CheckCircle2 />
              Selesaikan Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
