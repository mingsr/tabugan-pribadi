import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AmountCell, CategoryBadge, DateCell } from '@/components/shared/TransactionCells'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt } from 'lucide-react'
import type { Transaction } from '@/types/transaction'

export type TransactionSortKey = 'tanggal' | 'nominal'
export type SortDirection = 'asc' | 'desc'

export interface TransactionSortState {
  key: TransactionSortKey
  direction: SortDirection
}

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading?: boolean
  sort?: TransactionSortState
  onSortChange?: (sort: TransactionSortState) => void
  /** Bila diberikan, tampilkan aksi Edit di setiap baris (desktop & mobile). */
  onEdit?: (transaction: Transaction) => void
  /** Bila diberikan, tampilkan aksi Hapus di setiap baris. Tanpa keduanya = mode READ-ONLY (Riwayat). */
  onDelete?: (transaction: Transaction) => void
  emptyTitle?: string
  emptyDescription?: string
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSortChange,
}: {
  label: string
  sortKey: TransactionSortKey
  sort?: TransactionSortState
  onSortChange?: (sort: TransactionSortState) => void
}) {
  if (!onSortChange) {
    return <span>{label}</span>
  }

  const isActive = sort?.key === sortKey
  const Icon = isActive ? (sort?.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      type="button"
      onClick={() =>
        onSortChange({
          key: sortKey,
          direction: isActive && sort?.direction === 'desc' ? 'asc' : 'desc',
        })
      }
      className="flex items-center gap-1 text-left transition-colors duration-150 hover:text-foreground"
    >
      {label}
      <Icon className={`size-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
    </button>
  )
}

/**
 * TransactionTable — SATU implementasi dipakai halaman Transaksi (mode CRUD)
 * DAN Riwayat (mode read-only, tanpa `onEdit`/`onDelete`) — §5 Component
 * Mapping: "hindari duplikasi seperti tabel Transaksi vs Riwayat di versi
 * lama".
 *
 * Responsive: `<table>` sungguhan di breakpoint tablet ke atas (≥768px,
 * `hidden md:block`), `TransactionCard` list di mobile (`md:hidden`) —
 * SATU sumber data yang sama dirender dua cara berbeda, bukan dua
 * komponen terpisah.
 */
export function TransactionTable({
  transactions,
  isLoading = false,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  emptyTitle = 'Belum ada transaksi',
  emptyDescription = 'Transaksi yang kamu catat akan muncul di sini.',
}: TransactionTableProps) {
  const hasActions = Boolean(onEdit || onDelete)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return <EmptyState icon={Receipt} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <>
      {/* Desktop & tablet — tabel horizontal-scroll bila sempit */}
      <div className="hidden overflow-x-auto rounded-lg border border-white/10 md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">
                <SortableHeader label="Tanggal" sortKey="tanggal" sort={sort} onSortChange={onSortChange} />
              </th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Keterangan</th>
              <th className="px-4 py-3 text-right font-medium">
                <div className="flex justify-end">
                  <SortableHeader label="Nominal" sortKey="nominal" sort={sort} onSortChange={onSortChange} />
                </div>
              </th>
              {hasActions && <th className="w-10 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                className="border-b border-white/5 transition-colors duration-150 last:border-0 hover:bg-white/5"
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  <DateCell isoDate={tx.tanggal} />
                </td>
                <td className="px-4 py-3">
                  <CategoryBadge tipe={tx.tipe} kategori={tx.kategori} />
                </td>
                <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                  {tx.keterangan || '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <AmountCell tipe={tx.tipe} nominal={tx.nominal} />
                </td>
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Menu aksi</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(tx)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem variant="destructive" onClick={() => onDelete(tx)}>
                            <Trash2 />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — card list */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} transaction={tx} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </>
  )
}
