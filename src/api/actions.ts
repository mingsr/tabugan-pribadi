/**
 * api/actions.ts — API Action Mapping.
 *
 * Sumber tunggal (single source of truth) untuk seluruh 20 action backend,
 * PERSIS sesuai Final Architecture Specification §7 — tidak boleh
 * ditambah/diubah/dihapus tanpa persetujuan eksplisit pengguna (Master
 * Prompt, Aturan Implementasi #4).
 */

export const ACTIONS = {
  LOGIN: 'login',
  VALIDATE_TOKEN: 'validateToken',
  CHANGE_PASSWORD: 'changePassword',
  GET_DASHBOARD: 'getDashboard',
  ADD_TRANSACTION: 'addTransaction',
  GET_TRANSACTIONS: 'getTransactions',
  EDIT_TRANSACTION: 'editTransaction',
  DELETE_TRANSACTION: 'deleteTransaction',
  GET_TARGET: 'getTarget',
  UPDATE_TARGET: 'updateTarget',
  COMPLETE_TARGET: 'completeTarget',
  CREATE_TARGET: 'createTarget',
  GET_HALL_OF_FAME: 'getHallOfFame',
  GET_ACHIEVEMENTS: 'getAchievements',
  GET_QUOTE: 'getQuote',
  GET_MONTHLY_STAT: 'getMonthlyStat',
  GET_MONTHLY_TREND: 'getMonthlyTrend',
  SIMULATE_TARGET: 'simulateTarget',
  BACKUP: 'backup',
  RESTORE: 'restore',
} as const

export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS]

/** Action yang TIDAK memerlukan token (publik) — hanya `login`, sesuai §7 kolom "Auth". */
export const PUBLIC_ACTIONS: ReadonlyArray<ActionName> = [ACTIONS.LOGIN]

/** `true` bila action tersebut butuh token terautentikasi (semua action KECUALI `login`). */
export function actionRequiresToken(action: ActionName): boolean {
  return !PUBLIC_ACTIONS.includes(action)
}
