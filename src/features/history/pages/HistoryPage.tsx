import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { useTransactions } from '@/hooks/useTransactions'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/Pagination'
import {
  TransactionTable,
  type TransactionSortState,
} from '@/components/shared/TransactionTable'
import { PageTransition } from '@/components/layout/PageTransition'

import {
  TransactionFilterBar,
  type DateRangeFilter,
  type TypeFilterValue,
} from '@/features/transactions/components/TransactionFilterBar'

const PAGE_SIZE = 10
/** Riwayat menampilkan SELURUH tipe (bukan hanya yang bisa dibuat dari Modul Keuangan). */
const ALL_TX_TYPES = ['INCOME', 'EXPENSE', 'SAVING', 'WITHDRAWAL'] as const

/**
 * HistoryPage — route `/riwayat` (§11), READ-ONLY.
 *
 * Reuse TOTAL `TransactionTable` & `TransactionFilterBar` dari
 * `features/transactions/` — TIDAK ada `onEdit`/`onDelete` yang dioper,
 * sehingga `TransactionTable` otomatis merender tanpa kolom/menu aksi
 * (§5: "TransactionTable reusable mode read-only untuk Riwayat").
 */
export function HistoryPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('ALL')
  const [dateRange, setDateRange] = useState<DateRangeFilter>({})
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TransactionSortState>({ key: 'tanggal', direction: 'desc' })

  const offset = (page - 1) * PAGE_SIZE
  const { data, isLoading, isError, refetch, isFetching } = useTransactions({
    tipe: typeFilter === 'ALL' ? undefined : typeFilter,
    tanggal_mulai: dateRange.tanggal_mulai,
    tanggal_selesai: dateRange.tanggal_selesai,
    limit: PAGE_SIZE,
    offset,
  })

  const visibleTransactions = useMemo(() => {
    const list = data?.transactions ?? []
    const keyword = search.trim().toLowerCase()

    const filtered = keyword
      ? list.filter(
          (tx) =>
            tx.kategori.toLowerCase().includes(keyword) ||
            tx.keterangan.toLowerCase().includes(keyword),
        )
      : list

    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      if (sort.key === 'nominal') return (a.nominal - b.nominal) * dir
      return a.tanggal.localeCompare(b.tanggal) * dir
    })
  }, [data, search, sort])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Riwayat"
          subtitle="Seluruh riwayat transaksi (read-only)"
          breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Riwayat' }]}
        />

        <TransactionFilterBar
          typeOptions={[...ALL_TX_TYPES]}
          typeFilter={typeFilter}
          onTypeFilterChange={(value) => {
            setTypeFilter(value)
            setPage(1)
          }}
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range)
            setPage(1)
          }}
          search={search}
          onSearchChange={setSearch}
        />

        {isError && !isLoading ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="font-medium text-foreground">Gagal memuat riwayat</p>
              <p className="text-sm text-muted-foreground">Periksa koneksi internetmu, lalu coba lagi.</p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Mencoba lagi...' : 'Coba Lagi'}
            </Button>
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={visibleTransactions}
              isLoading={isLoading}
              sort={sort}
              onSortChange={(next) => setSort(next)}
              emptyTitle={search ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat transaksi'}
              emptyDescription={
                search ? 'Coba ubah kata kunci pencarian atau filter.' : 'Riwayat transaksimu akan muncul di sini.'
              }
            />

            {!isLoading && data && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>
    </PageTransition>
  )
}
