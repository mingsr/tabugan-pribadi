/**
 * api/errors.ts — Error Handler terpusat.
 *
 * Tiga kategori error yang mungkin terjadi saat memanggil backend RPC:
 * 1. ApiError      — backend merespons `{ success:false, error, code }` (error bisnis)
 * 2. NetworkError   — request gagal terkirim sama sekali (offline, DNS, CORS, dll.)
 * 3. TimeoutError   — request dibatalkan karena melebihi batas waktu (AbortController)
 */

export class ApiError extends Error {
  readonly code: number
  readonly isApiError = true as const

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export class NetworkError extends Error {
  readonly isNetworkError = true as const

  constructor(message = 'Tidak dapat terhubung ke server. Periksa koneksi internetmu.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  readonly isTimeoutError = true as const

  constructor(message = 'Permintaan memakan waktu terlalu lama. Coba lagi.') {
    super(message)
    this.name = 'TimeoutError'
  }
}

/** Type guard — apakah sebuah unknown error adalah ApiError kita. */
export function isApiErrorInstance(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Coba konversi unknown error menjadi ApiError bila memungkinkan (untuk pengecekan kode). */
export function toApiError(error: unknown): ApiError | null {
  return isApiErrorInstance(error) ? error : null
}

/**
 * isAuthError — heuristik deteksi error terkait token invalid/expired.
 *
 * §7 tidak mendokumentasikan katalog kode error numerik backend secara
 * eksplisit, jadi deteksi ini berbasis kata kunci pada pesan error
 * (case-insensitive) — bukan berdasarkan kode yang di-hardcode dari asumsi.
 * Bila di kemudian hari ditemukan kode error auth yang eksplisit dari
 * backend, heuristik ini harus diperbarui (bukan ditambah asumsi baru).
 */
export function isAuthError(error: unknown): boolean {
  const apiError = toApiError(error)
  if (!apiError) return false

  const message = apiError.message.toLowerCase()
  return (
    (message.includes('token') &&
      (message.includes('invalid') || message.includes('expired') || message.includes('tidak valid'))) ||
    message.includes('unauthor')
  )
}

/**
 * parseErrorMessage — ubah error apa pun (ApiError/NetworkError/TimeoutError/
 * unknown) menjadi pesan singkat yang aman ditampilkan ke pengguna (mis. lewat
 * `toast.error(...)`).
 */
export function parseErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof NetworkError) return error.message
  if (error instanceof TimeoutError) return error.message
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui.'
}
