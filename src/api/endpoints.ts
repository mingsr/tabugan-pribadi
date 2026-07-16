/**
 * api/endpoints.ts — Konfigurasi endpoint backend.
 *
 * BASE_URL WAJIB diambil dari environment variable (`VITE_API_URL`), TIDAK
 * boleh di-hardcode di file mana pun. Backend adalah satu Web App Google
 * Apps Script (RPC via field `payload`) — tidak ada endpoint kedua/tambahan.
 */

const rawBaseUrl = import.meta.env.VITE_API_URL

if (!rawBaseUrl) {
  // Gagal cepat & jelas saat development bila .env belum diisi, daripada
  // error fetch yang membingungkan di tengah pemakaian.
  // eslint-disable-next-line no-console
  console.error(
    '[api/endpoints] VITE_API_URL belum diset. Salin .env.example menjadi .env lalu isi Web App URL Google Apps Script.',
  )
}

/** Web App URL Google Apps Script — satu-satunya endpoint backend aplikasi ini. */
export const BASE_URL = rawBaseUrl ?? ''
