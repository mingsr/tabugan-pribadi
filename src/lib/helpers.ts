/**
 * lib/helpers.ts — Utility Function umum lintas API/Service/Hook layer.
 */

/**
 * sha256Hex — hash sebuah string dengan SHA-256, hasil hex lowercase.
 *
 * Dipakai auth.service.ts untuk hashing password SEBELUM dikirim ke
 * backend (Component Mapping §5: "Hash password tetap SHA-256 di client
 * sebelum kirim") — mekanisme autentikasi TIDAK diubah dari aplikasi lama.
 * Memakai Web Crypto API bawaan browser (`crypto.subtle`), tanpa
 * dependency tambahan.
 */
export async function sha256Hex(value: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Web Crypto API tidak tersedia di environment ini — hashing password tidak bisa dilakukan.',
    )
  }

  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Delay sederhana berbasis Promise, dipakai retry-with-backoff. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface RetryOptions {
  /** Jumlah percobaan ULANG (tidak termasuk percobaan pertama). Default 0 (tanpa retry). */
  retries?: number
  /** Delay dasar antar percobaan dalam ms. Default 500ms, naik eksponensial. */
  baseDelayMs?: number
  /** Dipanggil sebelum setiap percobaan ulang (untuk logging/telemetry opsional). */
  onRetry?: (attempt: number, error: unknown) => void
  /** Tentukan apakah error tertentu layak di-retry. Default: selalu retry. */
  shouldRetry?: (error: unknown) => boolean
}

/**
 * retryWithBackoff — jalankan `fn`, ulangi dengan exponential backoff bila
 * gagal. Dipakai api/client.ts KHUSUS untuk error transient (network/timeout),
 * BUKAN untuk error bisnis `{ success:false }` dari backend (retry tidak
 * akan mengubah hasil pada error bisnis yang deterministik).
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  { retries = 0, baseDelayMs = 500, onRetry, shouldRetry }: RetryOptions = {},
): Promise<T> {
  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (error) {
      const canRetry = attempt < retries && (shouldRetry ? shouldRetry(error) : true)
      if (!canRetry) throw error

      attempt += 1
      onRetry?.(attempt, error)
      await sleep(baseDelayMs * 2 ** (attempt - 1))
    }
  }
}

/** Parse JSON secara aman, mengembalikan `fallback` bila gagal alih-alih throw. */
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * buildStableQueryParam — normalisasi object filter/params menjadi bentuk
 * yang stabil untuk dipakai sebagai bagian dari query key TanStack Query
 * (urutan key diseragamkan supaya `{a:1,b:2}` dan `{b:2,a:1}` menghasilkan
 * key yang identik, mencegah cache-miss yang tidak perlu).
 */
export function buildStableQueryParam<T extends object>(params: T): T {
  const sortedEntries = Object.entries(params as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))

  return Object.fromEntries(sortedEntries) as T
}
