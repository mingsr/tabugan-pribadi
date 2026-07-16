import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type { GetAchievementsResponse } from '@/types/achievement'

/**
 * services/achievement.service.ts — action #14 (§7): getAchievements.
 * Seluruh logika unlock/progress dihitung backend — service ini murni
 * mengambil hasilnya, tidak ada kalkulasi di frontend (Master Prompt §2).
 */

async function getAchievements(): Promise<GetAchievementsResponse> {
  return callApi<GetAchievementsResponse>(ACTIONS.GET_ACHIEVEMENTS)
}

export const achievementService = {
  getAchievements,
}
