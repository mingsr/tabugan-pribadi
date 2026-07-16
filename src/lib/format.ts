/**
 * lib/format.ts — Utility formatting, port dari `app.js` lama §4 (rp(),
 * formatDate(), dst.), sesuai Final Architecture Specification §2.
 */

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Format angka menjadi Rupiah, mis. `rp(1500000)` → "Rp 1.500.000". */
export function rp(value: number): string {
  return rupiahFormatter.format(Number.isFinite(value) ? value : 0)
}

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
})

/** Parse "YYYY-MM-DD" jadi Date lokal (hindari pergeseran timezone dari `new Date(str)`). */
function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** Format tanggal lengkap ala Indonesia, mis. "Selasa, 14 Juli 2026". */
export function formatDateLong(isoDateOrDate: string | Date): string {
  const date = typeof isoDateOrDate === 'string' ? parseIsoDate(isoDateOrDate) : isoDateOrDate
  return longDateFormatter.format(date)
}

/** Format tanggal pendek untuk label chart/kalender, mis. "14 Jul". */
export function formatDateShort(isoDateOrDate: string | Date): string {
  const date = typeof isoDateOrDate === 'string' ? parseIsoDate(isoDateOrDate) : isoDateOrDate
  return shortDateFormatter.format(date)
}

/** Tanggal hari ini dalam format "YYYY-MM-DD", konsisten dengan format tanggal backend. */
export function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Sapaan berdasarkan jam saat ini — "Selamat Pagi/Siang/Sore/Malam". */
export function greetingByHour(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 10) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

/** Bangun daftar tanggal ISO (YYYY-MM-DD) N hari ke belakang HINGGA hari ini (inklusif). */
export function lastNDaysIso(n: number, endDate: Date = new Date()): string[] {
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(endDate)
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
  }
  return dates
}
