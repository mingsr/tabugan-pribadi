import { ApiError } from '@/api/errors'
import type { ApiResponse } from '@/types/api'

/**
 * api/response.ts — Generic Response Handler.
 *
 * Backend SELALU merespons salah satu dari dua bentuk (§7):
 *   { success: true,  data: T }
 *   { success: false, error: string, code: number }
 * File ini murni memvalidasi & mengekstrak bentuk itu — tidak melakukan
 * fetch (itu tanggung jawab api/client.ts).
 */

/** Type guard sukses. */
export function isApiSuccess<T>(response: ApiResponse<T>): response is Extract<ApiResponse<T>, { success: true }> {
  return response.success === true
}

/** Type guard gagal. */
export function isApiError<T>(response: ApiResponse<T>): response is Extract<ApiResponse<T>, { success: false }> {
  return response.success === false
}

/**
 * parseApiResponse — validasi bentuk JSON mentah dari backend, lalu
 * kembalikan `data` bila sukses atau lempar `ApiError` bila gagal.
 *
 * Melempar `ApiError` generik (code -1) bila JSON tidak memiliki bentuk
 * envelope yang diharapkan sama sekali (mis. backend down/error HTML dari
 * Google, bukan JSON RPC yang valid) — supaya pemanggil tetap mendapat
 * satu jenis error yang konsisten untuk ditangani.
 */
export function parseApiResponse<T>(raw: unknown): T {
  if (
    typeof raw !== 'object' ||
    raw === null ||
    typeof (raw as { success?: unknown }).success !== 'boolean'
  ) {
    throw new ApiError('Format respons dari server tidak dikenali.', -1)
  }

  const response = raw as ApiResponse<T>

  if (isApiSuccess(response)) {
    return response.data
  }

  if (isApiError(response)) {
    throw new ApiError(response.error || 'Terjadi kesalahan pada server.', response.code)
  }

  // Tidak akan tercapai secara logis (union sudah lengkap), tapi tetap aman untuk TypeScript.
  throw new ApiError('Format respons dari server tidak dikenali.', -1)
}
