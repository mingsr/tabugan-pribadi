import { BASE_URL } from '@/api/endpoints'
import { ACTIONS, actionRequiresToken, type ActionName } from '@/api/actions'
import { buildRequestEnvelope, serializeRequestBody, type RequestOptions } from '@/api/request'
import { parseApiResponse } from '@/api/response'
import { ApiError, NetworkError, TimeoutError, isAuthError } from '@/api/errors'
import { retryWithBackoff } from '@/lib/helpers'
import { tokenManager } from '@/lib/token'
import type { RpcRequestEnvelope } from '@/types/api'

/**
 * api/client.ts — API Client inti.
 *
 * Satu fungsi (`callApi`) yang dipakai SELURUH `services/*.service.ts`
 * untuk berbicara dengan backend. Menangani:
 * - Token injection otomatis (kecuali action publik, saat ini hanya `login`)
 * - Request/Response interceptor (hook titik perluasan, mis. logging)
 * - Timeout via `AbortController`
 * - Retry (exponential backoff) KHUSUS error jaringan/timeout — BUKAN error bisnis
 * - Auto-clear token bila backend menandakan token invalid/expired
 */

const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_NETWORK_RETRIES = 1

// ── Interceptor registry ────────────────────────────────────────────────
type RequestInterceptor = (
  envelope: RpcRequestEnvelope,
) => RpcRequestEnvelope | Promise<RpcRequestEnvelope>
type ResponseInterceptor = (data: unknown) => unknown | Promise<unknown>

const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []

/** Daftarkan interceptor yang dijalankan sebelum request dikirim (mengubah envelope). */
export function registerRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor)
  return () => {
    const idx = requestInterceptors.indexOf(interceptor)
    if (idx >= 0) requestInterceptors.splice(idx, 1)
  }
}

/** Daftarkan interceptor yang dijalankan setelah response sukses diparsing (mengubah data). */
export function registerResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor)
  return () => {
    const idx = responseInterceptors.indexOf(interceptor)
    if (idx >= 0) responseInterceptors.splice(idx, 1)
  }
}

// Default interceptor bawaan: log ringan di development untuk memudahkan debugging RPC.
if (import.meta.env.DEV) {
  registerRequestInterceptor((envelope) => {
    // eslint-disable-next-line no-console
    console.debug('[api] →', envelope.action, envelope.data ?? {})
    return envelope
  })
  registerResponseInterceptor((data) => data)
}

async function runRequestInterceptors(envelope: RpcRequestEnvelope): Promise<RpcRequestEnvelope> {
  let current = envelope
  for (const interceptor of requestInterceptors) {
    current = await interceptor(current)
  }
  return current
}

async function runResponseInterceptors<T>(data: T): Promise<T> {
  let current: unknown = data
  for (const interceptor of responseInterceptors) {
    current = await interceptor(current)
  }
  return current as T
}

/** Satu percobaan fetch + timeout, TANPA retry (retry ditangani pemanggil). */
async function fetchOnce(body: URLSearchParams, timeoutMs: number, externalSignal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(new TimeoutError()), timeoutMs)

  // Gabungkan external signal (mis. unmount komponen) dengan timeout signal.
  const onExternalAbort = () => controller.abort(externalSignal?.reason)
  externalSignal?.addEventListener('abort', onExternalAbort)

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })

    if (!response.ok) {
      // Backend Apps Script biasanya tetap balas 200 dengan body JSON error,
      // tapi kita tetap jaga-jaga untuk status HTTP non-2xx (mis. 500 dari Google).
      throw new NetworkError(`Server merespons dengan status ${response.status}.`)
    }

    return await response.json()
  } catch (error) {
    if (controller.signal.aborted) {
      throw new TimeoutError()
    }
    if (error instanceof NetworkError) throw error
    // TypeError dari fetch = biasanya kegagalan jaringan (offline, CORS, DNS, dll.)
    throw new NetworkError()
  } finally {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', onExternalAbort)
  }
}

/**
 * callApi — satu-satunya pintu masuk ke backend RPC. Dipakai oleh seluruh
 * `services/*.service.ts`, TIDAK dipanggil langsung dari hook/komponen.
 *
 * @param action  Nama action, harus salah satu dari `ACTIONS` (api/actions.ts)
 * @param data    Payload `data` sesuai kontrak action tsb (lihat types/*.ts)
 * @param options Timeout/retry/abort signal opsional per pemanggilan
 */
export async function callApi<TResponse, TData = undefined>(
  action: ActionName,
  data?: TData,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_NETWORK_RETRIES, signal } = options

  const token = actionRequiresToken(action) ? tokenManager.getToken() : null

  if (actionRequiresToken(action) && !token) {
    // Gagal cepat tanpa memanggil network sama sekali bila jelas-jelas belum login.
    throw new ApiError('Sesi tidak ditemukan. Silakan login kembali.', 401)
  }

  let envelope: RpcRequestEnvelope = buildRequestEnvelope(action, data, token)
  envelope = await runRequestInterceptors(envelope)

  const body = serializeRequestBody(envelope)

  const raw = await retryWithBackoff(() => fetchOnce(body, timeoutMs, signal), {
    retries,
    baseDelayMs: 600,
    // Hanya retry error TRANSIENT (jaringan/timeout) — error bisnis dari
    // backend (ApiError, mis. "username salah") TIDAK di-retry karena
    // hasilnya deterministik dan retry hanya membuang kuota.
    shouldRetry: (error) => error instanceof NetworkError || error instanceof TimeoutError,
  })

  try {
    const parsed = parseApiResponse<TResponse>(raw)
    return await runResponseInterceptors(parsed)
  } catch (error) {
    if (isAuthError(error)) {
      // Token backend sudah tidak valid/kedaluwarsa — bersihkan token lokal
      // supaya state frontend konsisten. AuthContext (Tahap 3.4) subscribe
      // ke perubahan ini untuk redirect ke /login + toast "Sesi berakhir".
      tokenManager.clearToken('expired')
    }
    throw error
  }
}

/** Re-export ACTIONS supaya service layer cukup import dari satu tempat bila mau. */
export { ACTIONS }
