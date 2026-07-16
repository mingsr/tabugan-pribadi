/**
 * types/simulator.ts — sesuai §7 (action #18 simulateTarget) & §8.
 */

import type { AchievementUnlock } from './api'

export type SimFrequency = 'daily' | 'weekly' | 'monthly'

export interface SimulateTargetRequest {
  target_nominal: number
  current_saving?: number
  amount: number
  frequency: SimFrequency
}

export interface SimulateMilestone {
  persen: number
  nominal_milestone: number
  jumlah_periode: number
  jumlah_hari: number
  estimasi_tanggal: string
}

export interface SimulateTargetResponse {
  input: SimulateTargetRequest
  sisa_nominal: number
  jumlah_periode: number
  jumlah_hari: number
  jumlah_minggu: number
  jumlah_bulan: number
  estimasi_selesai: string
  detail_per_milestone: SimulateMilestone[]
  new_achievements: AchievementUnlock[]
}
