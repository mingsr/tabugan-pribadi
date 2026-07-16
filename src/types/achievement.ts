/**
 * types/achievement.ts — sesuai §7 (action #14 getAchievements) & §8.
 */

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'MYTHIC' | 'ARTIFACT'

export interface Achievement {
  achievement_key: string
  nama: string
  clue: string
  deskripsi: string
  icon: string
  category: string
  rarity: Rarity
  xp_reward: number
  display_order: number
  is_secret: boolean
  is_unlocked: boolean
  tanggal_unlock: string | null
  progress: number | null
  target: number | null
  progress_percent: number | null
}

export interface AchievementSummary {
  opened_count: number
  locked_count: number
  total_xp: number
  common_count: number
  uncommon_count: number
  rare_count: number
  epic_count: number
  mythic_count: number
  artifact_count: number
}

export interface GetAchievementsResponse {
  achievements: Achievement[]
  total: number
  summary: AchievementSummary
}
