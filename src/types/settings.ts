/**
 * types/settings.ts — sesuai §7 (action #19 backup, #20 restore) & §8.
 *
 * CATATAN PENTING (bukan penyimpangan, murni observasi untuk tahap
 * berikutnya): Master Prompt §8 poin 13 menyebut halaman Pengaturan berisi
 * "reset data", tapi Final Architecture Specification §7 hanya mendaftar
 * 20 action dan TIDAK ada action `resetData`/`reset` di antaranya. File ini
 * TIDAK menambah action baru (sesuai Aturan Implementasi #4) — bila fitur
 * Pengaturan (Tahap 3.13) benar-benar butuh "reset data", itu harus
 * dilaporkan & dikonfirmasi ke pengguna dulu (apakah memakai `restore`
 * dengan backup_data kosong, atau perlu action baru), bukan diasumsikan
 * sekarang.
 */

import type { AchievementUnlock } from './api'
import type { Transaction } from './transaction'
import type { Wishlist } from './wishlist'
import type { HallOfFameEntry } from './wishlist'

export interface BackupData {
  version: string
  transactions: Transaction[]
  targets: Array<Omit<Wishlist, 'total_saving' | 'kurang' | 'persen' | 'prediksi_selesai'>>
  achievements: Array<{ id: string; achievement_key: string; tanggal_unlock: string }>
  hall_of_fame: HallOfFameEntry[]
  config: Record<string, string>
}

export interface BackupResponse {
  backup_data: BackupData
  timestamp: string
  new_achievements: AchievementUnlock[]
}

export interface RestoreRequest {
  backup_data: BackupData
}

export interface RestoreResponse {
  message: string
  restored: {
    transactions: number
    targets: number
    achievements: number
    hall_of_fame: number
  }
  new_achievements: AchievementUnlock[]
}
