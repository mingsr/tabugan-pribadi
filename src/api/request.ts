import type { ActionName } from '@/api/actions'
import type { RpcRequestEnvelope } from '@/types/api'

/**
 * api/request.ts — Generic Request Helper.
 *
 * Backend lama menerima POST dengan Content-Type urlencoded, field tunggal
 * `payload` berisi JSON string `{ action, token, data }` — format ini TIDAK
 * berubah (§12 Library Mapping: "Payload format tidak berubah, backend
 * tidak diubah"). Fungsi di file ini murni membangun request, tidak
 * melakukan fetch (itu tanggung jawab api/client.ts).
 */

/** Bangun envelope RPC mentah dari action + data + token. */
export function buildRequestEnvelope<TData>(
  action: ActionName,
  data: TData | undefined,
  token: string | null,
): RpcRequestEnvelope<TData> {
  return { action, token, data }
}

/**
 * Serialisasi envelope menjadi `URLSearchParams` siap kirim sebagai body
 * `fetch` (Content-Type: application/x-www-form-urlencoded), field `payload`.
 */
export function serializeRequestBody(envelope: RpcRequestEnvelope): URLSearchParams {
  const params = new URLSearchParams()
  params.set('payload', JSON.stringify(envelope))
  return params
}

/** Opsi request yang bisa dikustomisasi per pemanggilan (dipakai api/client.ts). */
export interface RequestOptions {
  /** Batas waktu request dalam ms sebelum di-abort. Default ditentukan di client.ts. */
  timeoutMs?: number
  /** Jumlah percobaan ulang KHUSUS untuk error jaringan/timeout. Default ditentukan di client.ts. */
  retries?: number
  /** AbortSignal eksternal (mis. dibatalkan manual oleh pemanggil / unmount komponen). */
  signal?: AbortSignal
}
