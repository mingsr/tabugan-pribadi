/**
 * lib/storage.ts — Local Storage Helper generik.
 *
 * Dipakai oleh lib/token.ts (token auth) dan kelak fitur lain yang butuh
 * localStorage (mis. "achievement seen" badge, preferensi collapse
 * sidebar — lihat §10 State Management). Sengaja generik & reusable,
 * bukan hardcode untuk satu key saja.
 */

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

/** Ambil nilai string mentah dari localStorage. `null` bila tidak ada / gagal. */
function getItem(key: string): string | null {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Storage bisa gagal (mode private/incognito penuh, quota, dll.) — jangan crash.
    return null
  }
}

/** Simpan nilai string ke localStorage. Mengembalikan `true` bila berhasil. */
function setItem(key: string, value: string): boolean {
  if (!isBrowser) return false
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Hapus satu key dari localStorage. */
function removeItem(key: string): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

/** Ambil & parse JSON dari localStorage. `fallback` dikembalikan bila gagal parse/tidak ada. */
function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Simpan value sebagai JSON string ke localStorage. */
function setJSON<T>(key: string, value: T): boolean {
  try {
    return setItem(key, JSON.stringify(value))
  } catch {
    return false
  }
}

export const storage = {
  isBrowser,
  getItem,
  setItem,
  removeItem,
  getJSON,
  setJSON,
}
