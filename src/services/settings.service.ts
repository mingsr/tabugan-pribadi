import { authService } from '@/services/auth.service'
import { backupService } from '@/services/backup.service'
import type { ChangePasswordInput } from '@/types/auth'
import type { BackupData } from '@/types/settings'

/**
 * services/settings.service.ts — KOMPOSER TIPIS untuk halaman Pengaturan.
 *
 * Tidak ada action backend baru yang khusus "settings" (§7 tidak
 * mendaftarkan action semacam itu) — halaman Pengaturan sebenarnya
 * mengombinasikan tiga action yang sudah dimiliki service lain:
 * `changePassword` (dari authService) dan `backup`/`restore` (dari
 * backupService). File ini HANYA re-export supaya `hooks/useSettings.ts`
 * punya satu pintu masuk yang jelas, TANPA menduplikasi logic yang sudah
 * ada di auth.service.ts / backup.service.ts.
 *
 * CATATAN "reset data": lihat komentar di types/settings.ts — tidak ada
 * action backend untuk ini di §7. Belum diimplementasikan di sini; harus
 * dikonfirmasi ke pengguna dulu saat Tahap 3.13 (Pengaturan) dikerjakan.
 */

async function changePassword(input: ChangePasswordInput) {
  return authService.changePassword(input)
}

async function createBackup() {
  return backupService.createBackup()
}

async function restoreBackup(backupData: BackupData) {
  return backupService.restoreBackup(backupData)
}

export const settingsService = {
  changePassword,
  createBackup,
  restoreBackup,
}
