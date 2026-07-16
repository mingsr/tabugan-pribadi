import { storage } from '@/lib/storage'

/**
 * lib/token.ts — Token Manager terpusat.
 *
 * Mekanisme autentikasi TIDAK diubah dari aplikasi lama: token opaque
 * (string) dari backend disimpan di localStorage dan dikirim di setiap
 * request RPC (lihat §1 Auth Layer & §10 State Management). Key storage
 * sengaja diberi prefix `nabung:` agar tidak bentrok dengan key lain,
 * padanan dari `TOKEN_KEY` di app.js lama.
 *
 * DIPERLUAS di Tahap 3.4 (Authentication) dari versi Tahap 3.3:
 * - `clearToken(reason)` sekarang membawa alasan ('manual' vs 'expired')
 *   supaya AuthContext tahu apakah harus menampilkan toast "Session Expired"
 *   atau tidak (logout manual tidak perlu toast expired).
 * - Listener sekarang juga terpicu di TAB YANG SAMA (event `storage` bawaan
 *   browser HANYA menyala di tab lain, tidak di tab yang melakukan
 *   perubahan) — dibutuhkan agar auto-logout langsung ter-refleksi di UI
 *   tab yang sedang aktif saat token ditolak backend (api/client.ts).
 */

const TOKEN_KEY = 'nabung:auth-token'
const USERNAME_KEY = 'nabung:auth-username'

export type TokenClearReason = 'manual' | 'expired' | 'cross-tab'

function getToken(): string | null {
  return storage.getItem(TOKEN_KEY)
}

function setToken(token: string): void {
  storage.setItem(TOKEN_KEY, token)
  notifyListeners('set')
}

function getUsername(): string | null {
  return storage.getItem(USERNAME_KEY)
}

function setUsername(username: string): void {
  storage.setItem(USERNAME_KEY, username)
}

/**
 * Hapus token + username tersimpan.
 * @param reason 'manual' (user klik logout) atau 'expired' (backend menolak
 *               token / validateToken gagal) — dipakai AuthContext untuk
 *               memutuskan perlu-tidaknya toast "Sesi berakhir".
 */
function clearToken(reason: Exclude<TokenClearReason, 'cross-tab'> = 'expired'): void {
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(USERNAME_KEY)
  notifyListeners(reason)
}

function hasToken(): boolean {
  return getToken() !== null
}

type TokenChangeEvent = { type: 'set' } | { type: TokenClearReason }
type TokenChangeListener = (event: TokenChangeEvent) => void
const listeners = new Set<TokenChangeListener>()

function notifyListeners(type: TokenChangeEvent['type']) {
  listeners.forEach((listener) => listener({ type } as TokenChangeEvent))
}

/**
 * Subscribe ke SEMUA perubahan token: set (login) & clear (logout/expired),
 * baik di tab yang sama maupun tab lain (`storage` event browser).
 * Dipakai `AuthContext` (Tahap 3.4) untuk auto-login/auto-logout reaktif.
 */
function subscribeToTokenChanges(listener: TokenChangeListener): () => void {
  listeners.add(listener)

  if (storage.isBrowser && listeners.size === 1) {
    window.addEventListener('storage', handleStorageEvent)
  }

  return () => {
    listeners.delete(listener)
    if (storage.isBrowser && listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== TOKEN_KEY) return
  // Token berubah dari TAB LAIN. `newValue` null berarti token dihapus di sana.
  listeners.forEach((listener) => listener({ type: event.newValue ? 'set' : 'cross-tab' }))
}

export const tokenManager = {
  getToken,
  setToken,
  getUsername,
  setUsername,
  clearToken,
  hasToken,
  subscribeToTokenChanges,
}
