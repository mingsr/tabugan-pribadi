import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type {
  CreateWishlistRequest,
  CreateWishlistResponse,
  CompleteWishlistResponse,
  GetHallOfFameResponse,
  UpdateWishlistRequest,
  Wishlist,
} from '@/types/wishlist'
import type { MessageResponse } from '@/types/api'

/**
 * services/wishlist.service.ts — action #9–13 (§7).
 *
 * "Wishlist" adalah rebranding istilah dari "Target Tabungan" (Master
 * Prompt §2) — nama action backend TETAP getTarget/createTarget/
 * updateTarget/completeTarget, tidak diubah.
 *
 * `getHallOfFame` (action #13) DISERTAKAN di sini karena Hall of Fame
 * secara konsep adalah "daftar wishlist yang sudah selesai", dan struktur
 * file Tahap 3.3 yang diminta TIDAK menyertakan `hall-of-fame.service.ts`
 * terpisah. Bila nanti ternyata dibutuhkan file terpisah untuk fitur Hall
 * of Fame (Tahap 3.11), `getHallOfFame` bisa dipindah — cukup ubah satu
 * baris impor di hooks/useWishlist.ts, tidak ada logic yang perlu ditulis
 * ulang.
 */

async function getTarget(): Promise<Wishlist | null> {
  return callApi<Wishlist | null>(ACTIONS.GET_TARGET)
}

async function createTarget(request: CreateWishlistRequest): Promise<CreateWishlistResponse> {
  return callApi<CreateWishlistResponse, CreateWishlistRequest>(ACTIONS.CREATE_TARGET, request)
}

async function updateTarget(request: UpdateWishlistRequest): Promise<MessageResponse> {
  return callApi<MessageResponse, UpdateWishlistRequest>(ACTIONS.UPDATE_TARGET, request)
}

async function completeTarget(): Promise<CompleteWishlistResponse> {
  return callApi<CompleteWishlistResponse>(ACTIONS.COMPLETE_TARGET)
}

async function getHallOfFame(): Promise<GetHallOfFameResponse> {
  return callApi<GetHallOfFameResponse>(ACTIONS.GET_HALL_OF_FAME)
}

export const wishlistService = {
  getTarget,
  createTarget,
  updateTarget,
  completeTarget,
  getHallOfFame,
}
