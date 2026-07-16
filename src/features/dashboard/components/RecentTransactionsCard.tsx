import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { toast } from 'sonner'

import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { rp, formatDateShort } from '@/lib/format'
import { TX_TYPE_META } from '@/lib/transaction-meta'
import type { Transaction } from '@/types/transaction'

function TransactionRow({ tx }: { tx: Transaction }) {
  const meta = TX_TYPE_META[tx.tipe]
  const Icon = meta.icon

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/5">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.accentClass}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-foreground">{tx.kategori}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDateShort(tx.tanggal)}
          {tx.keterangan ? ` · ${tx.keterangan}` : ''}
        </p>
      </div>
      <p className={`shrink-0 font-tabular text-sm font-semibold ${meta.amountClass}`}>
        {meta.sign > 0 ? '+' : '-'}
        {rp(tx.nominal)}
      </p>
    </div>
  )
}

/**
 * RecentTransactionsCard — 5 transaksi terakhir ("Recent Activity").
 *
 * CATATAN: `getDashboard` (§8) TIDAK menyertakan daftar transaksi. Data
 * diambil dengan me-reuse `useTransactions({ limit: 5 })` (action
 * `getTransactions`, sudah ada sejak Tahap 3.3) — BUKAN endpoint baru,
 * murni pemakaian ulang hook yang sudah ada sesuai instruksi.
 */
export function RecentTransactionsCard() {
  const { data, isLoading, isError, refetch } = useTransactions({ limit: 5, offset: 0 })

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Transaksi Terakhir</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info('Halaman Riwayat belum tersedia')}
        >
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading && (
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">Gagal memuat transaksi terakhir.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Coba Lagi
            </Button>
          </div>
        )}

        {!isLoading && !isError && data && data.transactions.length === 0 && (
          <EmptyState
            icon={History}
            title="Belum ada transaksi"
            description="Transaksi yang kamu catat akan muncul di sini."
          />
        )}

        {!isLoading &&
          !isError &&
          data &&
          data.transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <TransactionRow tx={tx} />
            </motion.div>
          ))}
      </CardContent>
    </Card>
  )
}
