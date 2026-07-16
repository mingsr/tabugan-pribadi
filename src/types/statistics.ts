/**
 * types/statistics.ts — sesuai §7 (action #16 getMonthlyStat, #17 getMonthlyTrend) & §8.
 */

import type { TxType } from './transaction'

export interface CategoryStat {
  kategori: string
  total: number
  persentase: number
  jumlah_tx: number
}

export interface GetMonthlyStatRequest {
  bulan?: number
  tahun?: number
}

export interface MonthlyStat {
  bulan: number
  tahun: number
  period: string
  summary: {
    total_income: number
    total_expense: number
    total_saving: number
    total_withdrawal: number
    net_saving: number
    saldo_bersih: number
    jumlah_tx: number
  }
  by_category: Record<TxType, CategoryStat[]>
  saving_dates: string[]
  daily_data: Array<{
    tanggal: string
    income: number
    expense: number
    saving: number
    withdrawal: number
  }>
}

export interface GetMonthlyTrendRequest {
  months?: number
}

export interface MonthlyTrendPoint {
  tahun: number
  bulan: number
  period: string
  income: number
  expense: number
  saving: number
  withdrawal: number
  net_saving: number
  saldo_bersih: number
  jumlah_tx: number
}

export interface GetMonthlyTrendResponse {
  months: number
  trend: MonthlyTrendPoint[]
}
