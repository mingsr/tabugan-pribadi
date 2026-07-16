/**
 * types/wishlist.ts — Wishlist adalah rebranding ISTILAH dari "Target
 * Tabungan" (bukan modul baru) — sesuai Keputusan Final Master Prompt §2.
 * Nama action backend TETAP getTarget/createTarget/updateTarget/completeTarget
 * (tidak diubah), hanya label di UI nanti yang memakai kata "Wishlist".
 *
 * Hall of Fame (`getHallOfFame`, action #13) ikut ditempatkan di file &
 * service ini karena secara konsep adalah "daftar wishlist yang sudah
 * selesai" dan tidak ada `hall-of-fame.service.ts` terpisah pada struktur
 * yang diminta Tahap 3.3 — lihat catatan yang sama di wishlist.service.ts.
 */

import type { AchievementUnlock } from './api'

export type WishlistStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface Wishlist {
  id: string
  nama_target: string
  target_nominal: number
  total_saving: number
  kurang: number
  persen: number
  tanggal_mulai: string
  tanggal_selesai?: string
  status: WishlistStatus
  /** Hanya terisi saat data ini berasal dari getDashboard, bukan getTarget langsung. */
  prediksi_selesai?: string | null
}

export interface CreateWishlistRequest {
  nama_target: string
  target_nominal: number
}

export interface CreateWishlistResponse {
  id: string
  message: string
  new_achievements: AchievementUnlock[]
}

export interface UpdateWishlistRequest {
  nama_target?: string
  target_nominal?: number
}

export interface CompleteWishlistResponse {
  message: string
  hof_id: string
  total_hari: number
  total_saving: number
  total_saving_tx: number
  new_achievements: AchievementUnlock[]
}

export interface HallOfFameEntry {
  id: string
  nama_target: string
  target_nominal: number
  total_hari: number
  tanggal_mulai: string
  tanggal_selesai: string
  total_saving_tx: number
}

export interface GetHallOfFameResponse {
  hall_of_fame: HallOfFameEntry[]
}
