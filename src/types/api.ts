/**
 * types/api.ts — Kontrak envelope RPC, sesuai
 * Final Architecture Specification §7 (API Contract).
 *
 * Format request  : POST urlencoded, field `payload` = JSON.stringify({ action, token, data })
 * Format response  : { success: true, data }  |  { success: false, error, code }
 *
 * Daftar action & nama literalnya didefinisikan di `api/actions.ts` (API
 * Action Mapping) — file ini hanya mengimpor tipenya agar tidak ada dua
 * sumber kebenaran untuk daftar action yang sama.
 */

import type { ActionName } from '@/api/actions'

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiErrorPayload {
  success: false
  error: string
  code: number
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorPayload

/**
 * Envelope request yang benar-benar dikirim ke backend (sebelum di-encode
 * jadi urlencoded field `payload`). `data` bertipe generik per action,
 * didefinisikan di masing-masing types/*.ts fitur.
 */
export interface RpcRequestEnvelope<TData = unknown> {
  action: ActionName
  token: string | null
  data?: TData
}

/** `new_achievements[]` hampir selalu ikut di response action yang memberi XP. */
export interface AchievementUnlock {
  achievement_key: string
  nama: string
  clue: string
  deskripsi: string
  icon: string
  category: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'MYTHIC' | 'ARTIFACT'
  xp_reward: number
  display_order: number
  is_secret: boolean
}

/** Response generik yang hanya berisi pesan status, dipakai beberapa action. */
export interface MessageResponse {
  message: string
}
