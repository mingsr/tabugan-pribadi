import { useQuery } from '@tanstack/react-query'

import { achievementService } from '@/services/achievement.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'

/**
 * hooks/useAchievements.ts — Hook Layer untuk action #14 (getAchievements).
 */
export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.achievements.root(),
    queryFn: () => achievementService.getAchievements(),
    enabled: tokenManager.hasToken(),
  })
}
