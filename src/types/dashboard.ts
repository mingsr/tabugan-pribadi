/**
 * types/dashboard.ts — sesuai §7 (action #4 getDashboard, #15 getQuote) & §8.
 */

import type { AchievementUnlock } from './api'
import type { Wishlist } from './wishlist'

export interface DailyChartPoint {
  tanggal: string
  income: number
  expense: number
  saving: number
}

export interface LevelInfo {
  level: number
  nama: string
  icon: string
  threshold_current: number
  threshold_next: number | null
  next_nama: string | null
  progress_persen: number
  total_xp: number
}

export interface Quote {
  id: number
  quote: string
  author: string
}

export interface GetQuoteResponse {
  quote: Quote
}

export type RecentAchievement = Pick<
  AchievementUnlock,
  'achievement_key' | 'nama' | 'icon' | 'rarity' | 'xp_reward'
> & { tanggal_unlock: string }

export interface DashboardData {
  target: Wishlist | null
  summary_today: { income: number; expense: number; saving: number }
  summary_30days: { total_income: number; total_expense: number; total_saving: number }
  level: LevelInfo
  streak: number
  recent_achievements: RecentAchievement[]
  total_achievements: number
  unlocked_achievements: number
  quote: Quote
  saving_dates: string[]
  chart_7days: DailyChartPoint[]
  chart_30days: DailyChartPoint[]
}
