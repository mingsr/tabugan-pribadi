import { motion } from 'framer-motion'
import { ArrowRight, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressBarGradient } from '@/components/shared/ProgressBarGradient'
import { rp, formatDateLong } from '@/lib/format'
import type { Wishlist } from '@/types/wishlist'

interface TargetSummaryCardProps {
  target: Wishlist | null
}

/**
 * TargetSummaryCard — ringkasan Wishlist aktif (§4/§5, ex-"Target
 * Tabungan"). Data dari `DashboardData.target` (bagian dari `getDashboard`,
 * bukan panggilan `getTarget` terpisah) — konsisten dengan §8.
 * Tombol "Detail"/"Buat Wishlist" menavigasi ke `/wishlist` (halaman
 * sungguhan sejak Tahap 3.7).
 */
export function TargetSummaryCard({ target }: TargetSummaryCardProps) {
  const navigate = useNavigate()

  if (!target) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wishlist Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Gift}
            title="Belum ada wishlist aktif"
            description="Buat wishlist untuk mulai menabung menuju target impianmu."
            action={{
              label: 'Buat Wishlist',
              onClick: () => navigate('/wishlist'),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Wishlist Aktif</CardTitle>
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Gift className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">
              {target.nama_target}
            </p>
            <p className="text-sm text-muted-foreground">Target {rp(target.target_nominal)}</p>
          </div>

          <ProgressBarGradient value={target.persen} />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Saat Ini</p>
              <p className="font-tabular font-semibold text-foreground">
                {rp(target.total_saving)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sisa Target</p>
              <p className="font-tabular font-semibold text-foreground">{rp(target.kurang)}</p>
            </div>
            {target.prediksi_selesai && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Estimasi Tercapai</p>
                <p className="font-medium text-foreground">
                  {formatDateLong(target.prediksi_selesai)}
                </p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => navigate('/wishlist')}
          >
            Detail
            <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
