import { useChangePassword } from '@/hooks/useAuth'
import { useCreateBackup, useRestoreBackup } from '@/hooks/useBackup'

/**
 * hooks/useSettings.ts — KOMPOSER TIPIS untuk halaman Pengaturan.
 *
 * Sama seperti services/settings.service.ts, hook ini TIDAK menulis ulang
 * logic mutation — hanya menggabungkan tiga hook yang sudah ada
 * (useChangePassword, useCreateBackup, useRestoreBackup) supaya komponen
 * `SettingsPage` (Tahap 3.13) cukup memanggil SATU hook.
 */
export function useSettings() {
  const changePassword = useChangePassword()
  const createBackup = useCreateBackup()
  const restoreBackup = useRestoreBackup()

  return {
    changePassword,
    createBackup,
    restoreBackup,
  }
}
