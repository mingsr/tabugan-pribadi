import { ArrowDownCircle, PiggyBank, Target, Wallet } from 'lucide-react'

import { StatCard } from '@/components/shared/StatCard'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { rp } from '@/lib/format'
import type { DashboardData } from '@/types/dashboard'

interface FinancialSummaryGridProps {
  data: DashboardData
}

/**
 * FinancialSummaryGrid — 4 kartu Ringkasan Keuangan.
 *
 * CATATAN PENTING (bukan penyimpangan diam-diam): `getDashboard` (§8)
 * TIDAK mengembalikan field "total saldo" (saldo keseluruhan all-time) —
 * hanya `summary_30days` (30 hari terakhir: total_income, total_expense,
 * total_saving). "Total Saldo" di sini dihitung sebagai NET 30 HARI
 * (`total_income - total_expense`), diberi label "Total Saldo (30 Hari)"
 * supaya tidak menyesatkan seolah itu saldo all-time — TIDAK memanggil
 * action/field baru, murni dihitung dari data yang sudah ada. Mohon
 * konfirmasi apakah definisi ini sudah sesuai kebutuhan, atau perlu
 * field all-time balance baru dari backend (di luar §7).
 */
export function FinancialSummaryGrid({ data }: FinancialSummaryGridProps) {
  const { summary_30days, target } = data
  const netBalance30d = summary_30days.total_income - summary_30days.total_expense
  const progressPersen = target?.persen ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Total Saldo (30 Hari)"
        accent="primary"
        helperText="Pemasukan − pengeluaran"
        value={<AnimatedNumber value={netBalance30d} format={rp} />}
      />
      <StatCard
        icon={PiggyBank}
        label="Total Nabung"
        accent="success"
        helperText="30 hari terakhir"
        value={<AnimatedNumber value={summary_30days.total_saving} format={rp} />}
      />
      <StatCard
        icon={ArrowDownCircle}
        label="Total Pengeluaran"
        accent="danger"
        helperText="30 hari terakhir"
        value={<AnimatedNumber value={summary_30days.total_expense} format={rp} />}
      />
      <StatCard
        icon={Target}
        label="Progress Target"
        accent="accent"
        helperText={target ? target.nama_target : 'Belum ada wishlist aktif'}
        value={<AnimatedNumber value={progressPersen} format={(v) => `${v.toFixed(0)}%`} />}
      />
    </div>
  )
}
