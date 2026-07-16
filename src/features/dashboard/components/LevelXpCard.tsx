import { motion } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { ProgressBarGradient } from '@/components/shared/ProgressBarGradient'
import type { LevelInfo } from '@/types/dashboard'

interface LevelXpCardProps {
  level: LevelInfo
}

/**
 * LevelXpCard — Level, nama level, total XP, progress menuju level
 * berikutnya. SELURUH kalkulasi (threshold, persen) dihitung backend
 * (`getDashboard`) — komponen ini murni menampilkan (Master Prompt §2:
 * "gamifikasi tetap, frontend murni menampilkan hasil").
 */
export function LevelXpCard({ level }: LevelXpCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card className="h-full">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-2xl shadow-[var(--shadow-soft)]">
              <span aria-hidden="true">{level.icon}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level {level.level}</p>
              <p className="font-heading text-base font-semibold text-foreground">{level.nama}</p>
            </div>
          </div>

          <ProgressBarGradient
            value={level.progress_persen}
            label={level.next_nama ? `Menuju ${level.next_nama}` : 'Level maksimum'}
          />

          <p className="text-xs text-muted-foreground">
            Total <span className="font-tabular font-semibold text-foreground">{level.total_xp}</span> XP
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
