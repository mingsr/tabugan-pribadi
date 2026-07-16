/**
 * types/auth.ts — sesuai §7 (action #1–3) & §8.
 */

/** Tipe wire yang benar-benar dikirim ke backend (password SUDAH di-hash SHA-256). */
export interface LoginRequest {
  username: string
  password_hash: string
}

/** Tipe input dari pemanggil service (password MASIH plain text, di-hash di service layer). */
export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface ValidateTokenResponse {
  valid: boolean
  username: string
}

/** Tipe wire — hash sudah dihitung. */
export interface ChangePasswordRequest {
  old_password_hash: string
  new_password_hash: string
}

/** Tipe input dari pemanggil service — plain text, di-hash di service layer. */
export interface ChangePasswordInput {
  oldPassword: string
  newPassword: string
}
