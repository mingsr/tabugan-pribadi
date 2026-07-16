import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { backupService } from '@/services/backup.service'
import { parseErrorMessage } from '@/api/errors'
import type { BackupData } from '@/types/settings'

/**
 * hooks/useBackup.ts — Hook Layer untuk action #19–20 (backup, restore).
 */

export function useCreateBackup() {
  return useMutation({
    mutationFn: () => backupService.createBackup(),
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

export function useRestoreBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (backupData: BackupData) => backupService.restoreBackup(backupData),
    onSuccess: (response) => {
      // Restore berpotensi mengubah SEMUA data (transaksi, wishlist, achievement,
      // hall of fame) — invalidate seluruh cache adalah pilihan paling aman.
      queryClient.invalidateQueries()
      toast.success(response.message || 'Data berhasil dipulihkan')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}
