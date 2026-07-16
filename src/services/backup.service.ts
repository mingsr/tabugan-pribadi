import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type { BackupData, BackupResponse, RestoreRequest, RestoreResponse } from '@/types/settings'

/**
 * services/backup.service.ts — action #19–20 (§7): backup, restore.
 * Dipakai fitur Pengaturan (Tahap 3.13) untuk unduh/unggah JSON backup.
 */

async function createBackup(): Promise<BackupResponse> {
  return callApi<BackupResponse>(ACTIONS.BACKUP)
}

async function restoreBackup(backupData: BackupData): Promise<RestoreResponse> {
  const request: RestoreRequest = { backup_data: backupData }
  return callApi<RestoreResponse, RestoreRequest>(ACTIONS.RESTORE, request)
}

export const backupService = {
  createBackup,
  restoreBackup,
}
