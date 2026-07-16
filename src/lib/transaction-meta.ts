import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet, type LucideIcon } from 'lucide-react'

import type { TxType } from '@/types/transaction'

interface TxTypeMeta {
  label: string
  icon: LucideIcon
  /** Kelas Tailwind untuk badge/ikon (bg + text). */
  accentClass: string
  /** Warna teks nominal (tanpa bg), dipakai AmountCell. */
  amountClass: string
  /** +1 untuk pemasukan/nabung (dana masuk), -1 untuk pengeluaran/tarik (dana keluar). */
  sign: 1 | -1
}

/**
 * lib/transaction-meta.ts — sumber tunggal label/ikon/warna per `TxType`.
 *
 * Sebelumnya ada salinan lokal serupa di `RecentTransactionsCard`
 * (Dashboard, Tahap 3.5) — dipindah ke sini di Tahap 3.6 supaya TIDAK ada
 * duplikasi kode antara Dashboard, Transaksi, dan Riwayat (semuanya
 * menampilkan baris transaksi dengan gaya yang sama).
 */
export const TX_TYPE_META: Record<TxType, TxTypeMeta> = {
  INCOME: {
    label: 'Pemasukan',
    icon: ArrowUpRight,
    accentClass: 'bg-success/15 text-success',
    amountClass: 'text-success',
    sign: 1,
  },
  EXPENSE: {
    label: 'Pengeluaran',
    icon: ArrowDownLeft,
    accentClass: 'bg-danger/15 text-danger',
    amountClass: 'text-danger',
    sign: -1,
  },
  SAVING: {
    label: 'Nabung',
    icon: PiggyBank,
    accentClass: 'bg-primary/15 text-primary',
    amountClass: 'text-success',
    sign: 1,
  },
  WITHDRAWAL: {
    label: 'Tarik',
    icon: Wallet,
    accentClass: 'bg-warning/15 text-warning',
    amountClass: 'text-danger',
    sign: -1,
  },
}

/** Dua tipe yang bisa dibuat dari Modul Keuangan (Tahap 3.6) — sesuai instruksi eksplisit. */
export const CREATABLE_TX_TYPES: Extract<TxType, 'SAVING' | 'EXPENSE'>[] = ['SAVING', 'EXPENSE']
