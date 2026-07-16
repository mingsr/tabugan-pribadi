import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import { sha256Hex } from '@/lib/helpers'
import { tokenManager } from '@/lib/token'
import type {
  ChangePasswordInput,
  ChangePasswordRequest,
  LoginCredentials,
  LoginRequest,
  LoginResponse,
  ValidateTokenResponse,
} from '@/types/auth'
import type { MessageResponse } from '@/types/api'

/**
 * services/auth.service.ts — action #1–3 (§7): login, validateToken, changePassword.
 *
 * Password di-hash SHA-256 DI SINI (bukan di komponen UI nanti), supaya
 * mekanisme hashing terpusat satu tempat dan konsisten dengan backend lama
 * (Component Mapping §5). Pemanggil (hooks/useAuth.ts, lalu UI Tahap 3.5)
 * cukup mengirim password plain text.
 */

/** Login — mengembalikan token & SEKALIGUS menyimpannya via tokenManager. */
async function login({ username, password }: LoginCredentials): Promise<LoginResponse> {
  const password_hash = await sha256Hex(password)
  const request: LoginRequest = { username, password_hash }

  const result = await callApi<LoginResponse, LoginRequest>(ACTIONS.LOGIN, request)

  tokenManager.setToken(result.token)
  tokenManager.setUsername(username)

  return result
}

/** Validasi token yang sedang tersimpan. Dipanggil sekali saat aplikasi mount (`RequireAuth`, Tahap 4/5). */
async function validateToken(): Promise<ValidateTokenResponse> {
  return callApi<ValidateTokenResponse>(ACTIONS.VALIDATE_TOKEN)
}

/** Ganti password — kedua password (lama & baru) di-hash SHA-256 sebelum dikirim. */
async function changePassword({ oldPassword, newPassword }: ChangePasswordInput): Promise<MessageResponse> {
  const [old_password_hash, new_password_hash] = await Promise.all([
    sha256Hex(oldPassword),
    sha256Hex(newPassword),
  ])

  const request: ChangePasswordRequest = { old_password_hash, new_password_hash }
  return callApi<MessageResponse, ChangePasswordRequest>(ACTIONS.CHANGE_PASSWORD, request)
}

/** Logout — murni operasi lokal (hapus token), backend tidak punya action `logout` terpisah. */
function logout(): void {
  tokenManager.clearToken('manual')
}

export const authService = {
  login,
  validateToken,
  changePassword,
  logout,
}
