import { motion } from 'framer-motion'
import { Award, Trophy } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import type { RecentAchievement } from '@/types/dashboard'

const RARITY_BADGE_VARIANT: Record<RecentAchievement['rarity'], BadgeProps['variant']> = {
  COMMON: 'rarity-common',
  UNCOMMON: 'rarity-uncommon',
  RARE: 'rarity-rare',
  EPIC: 'rarity-epic',
  MYTHIC: 'rarity-mythic',
  ARTIFACT: 'rarity-artifact',
}

interface RecentAchievementsProps {
  achievements: RecentAchievement[]
  totalAchievements: number
  unlockedAchievements: number
}

/**
 * RecentAchievements — preview MAKSIMAL 3 achievement terbaru + status
 * unlock + badge rarity, dari `DashboardData.recent_achievements` (§8).
 * Tombol "Lihat Semua" → placeholder (halaman Pencapaian belum dibuat,
 * Tahap 3.9).
 */
export function RecentAchievements({
  achievements,
  totalAchievements,
  unlockedAchievements,
}: RecentAchievementsProps) {
  const preview = achievements.slice(0, 3)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Pencapaian Terbaru</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {unlockedAchievements} / {totalAchievements} terbuka
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info('Halaman Pencapaian belum tersedia')}
        >
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {preview.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="Belum ada pencapaian terbuka"
            description="Terus menabung untuk membuka achievement pertamamu."
          />
        )}

        {preview.map((achievement, index) => (
          <motion.div
            key={achievement.achievement_key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 text-xl">
              <span aria-hidden="true">{achievement.icon}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-foreground">{achievement.nama}</p>
              <p className="text-xs text-muted-foreground">+{achievement.xp_reward} XP</p>
            </div>
            <Badge variant={RARITY_BADGE_VARIANT[achievement.rarity]}>
              {achievement.rarity}
            </Badge>
          </motion.div>
        ))}

        {preview.length > 0 && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="size-3.5" />
            Terus tingkatkan level untuk membuka lebih banyak achievement.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
