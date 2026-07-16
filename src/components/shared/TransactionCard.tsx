import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AmountCell, CategoryBadge, DateCell } from '@/components/shared/TransactionCells'
import type { Transaction } from '@/types/transaction'

interface TransactionCardProps {
  transaction: Transaction
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

/**
 * TransactionCard — representasi MOBILE satu baris transaksi (dipakai
 * `TransactionTable` di breakpoint mobile, §5 Component Mapping). Aksi
 * edit/hapus hanya muncul bila `onEdit`/`onDelete` diberikan (read-only
 * di halaman Riwayat).
 */
export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <CategoryBadge tipe={transaction.tipe} kategori={transaction.kategori} />

          <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
            <AmountCell tipe={transaction.tipe} nominal={transaction.nominal} />
            <span className="text-xs text-muted-foreground">
              <DateCell isoDate={transaction.tanggal} />
            </span>
          </div>

          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 size-8 shrink-0">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Menu aksi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(transaction)}>
                    <Trash2 />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardContent>
        {transaction.keterangan && (
          <div className="border-t border-white/10 px-4 py-2">
            <p className="truncate text-xs text-muted-foreground">{transaction.keterangan}</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
