import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'

interface StreakCardProps {
  streak: number
}

/** StreakCard — jumlah hari beruntun menabung, dari `DashboardData.streak` (§8). */
export function StreakCard({ streak }: StreakCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-5 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <Flame className="size-6" />
          </div>
          <div className="font-heading text-2xl font-semibold text-foreground font-tabular">
            <AnimatedNumber value={streak} />
          </div>
          <p className="text-xs text-muted-foreground">Hari beruntun menabung</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
