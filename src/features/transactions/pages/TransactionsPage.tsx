import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useTransactions } from '@/hooks/useTransactions'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/Pagination'
import {
  TransactionTable,
  type TransactionSortState,
} from '@/components/shared/TransactionTable'
import { PageTransition } from '@/components/layout/PageTransition'

import { CREATABLE_TX_TYPES } from '@/lib/transaction-meta'
import {
  TransactionFilterBar,
  type DateRangeFilter,
  type TypeFilterValue,
} from '@/features/transactions/components/TransactionFilterBar'
import { TransactionFormDialog } from '@/features/transactions/components/TransactionFormDialog'
import { DeleteTransactionDialog } from '@/features/transactions/components/DeleteTransactionDialog'
import type { Transaction } from '@/types/transaction'

const PAGE_SIZE = 10

/**
 * TransactionsPage — route `/transaksi` (§11), CRUD penuh.
 *
 * Server-side (via `getTransactions`, §8): filter `tipe`, rentang tanggal,
 * `limit`/`offset` (pagination).
 * Client-side (TIDAK ada field-nya di kontrak backend — lihat catatan di
 * `TransactionFilterBar`): search teks bebas & sort kolom, hanya berlaku
 * pada data yang sedang termuat di halaman aktif.
 */
export function TransactionsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>('ALL')
  const [dateRange, setDateRange] = useState<DateRangeFilter>({})
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TransactionSortState>({ key: 'tanggal', direction: 'desc' })

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [createDefaultTipe, setCreateDefaultTipe] = useState<'SAVING' | 'EXPENSE' | undefined>()

  // FAB mobile (AppShell) & Quick Action Dashboard menavigasi ke sini dengan
  // state { openAddDialog: true, presetTipe? }.
  useEffect(() => {
    const state = location.state as { openAddDialog?: boolean; presetTipe?: 'SAVING' | 'EXPENSE' } | null
    if (state?.openAddDialog) {
      setEditingTransaction(null)
      setCreateDefaultTipe(state.presetTipe)
      setFormDialogOpen(true)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

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

    const sorted = [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      if (sort.key === 'nominal') return (a.nominal - b.nominal) * dir
      return a.tanggal.localeCompare(b.tanggal) * dir
    })

    return sorted
  }, [data, search, sort])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  function handleEdit(transaction: Transaction) {
    if (transaction.tipe !== 'SAVING' && transaction.tipe !== 'EXPENSE') {
      toast.info('Tipe transaksi ini belum bisa diedit dari Modul Keuangan.')
      return
    }
    setEditingTransaction(transaction)
    setFormDialogOpen(true)
  }

  function handleAddNew() {
    setEditingTransaction(null)
    setCreateDefaultTipe(undefined)
    setFormDialogOpen(true)
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Transaksi"
          subtitle="Catat dan kelola seluruh transaksi Nabung & Pengeluaran"
          breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Transaksi' }]}
          action={
            <Button variant="gradient" onClick={handleAddNew}>
              <Plus />
              Tambah Transaksi
            </Button>
          }
        />

        <TransactionFilterBar
          typeOptions={CREATABLE_TX_TYPES}
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
              <p className="font-medium text-foreground">Gagal memuat transaksi</p>
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
              onEdit={handleEdit}
              onDelete={setDeletingTransaction}
              emptyTitle={search ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
              emptyDescription={
                search
                  ? 'Coba ubah kata kunci pencarian atau filter.'
                  : 'Mulai catat transaksi Nabung atau Pengeluaran pertamamu.'
              }
            />

            {!isLoading && data && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}

        <TransactionFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          editingTransaction={editingTransaction}
          createDefaultTipe={createDefaultTipe}
        />

        <DeleteTransactionDialog
          transaction={deletingTransaction}
          onOpenChange={(open) => {
            if (!open) setDeletingTransaction(null)
          }}
        />
      </div>
    </PageTransition>
  )
}
