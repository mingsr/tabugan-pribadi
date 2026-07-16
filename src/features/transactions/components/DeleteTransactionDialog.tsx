import { Trash2 } from 'lucide-react'

import {
  AnimatedDialogContent,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import { rp } from '@/lib/format'
import type { Transaction } from '@/types/transaction'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  onOpenChange: (open: boolean) => void
}

/**
 * DeleteTransactionDialog — Confirmation Dialog sebelum `deleteTransaction`
 * dieksekusi (§4). `transaction` berperan ganda sebagai data yang
 * ditampilkan DAN penentu `open` (null = tertutup).
 */
export function DeleteTransactionDialog({ transaction, onOpenChange }: DeleteTransactionDialogProps) {
  const deleteMutation = useDeleteTransaction()
  const open = Boolean(transaction)

  async function handleConfirm() {
    if (!transaction) return
    await deleteMutation.mutateAsync(transaction.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open}>
        <DialogHeader>
          <DialogTitle>Hapus transaksi ini?</DialogTitle>
          <DialogDescription>Tindakan ini tidak dapat dibatalkan.</DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
            <p className="font-medium text-foreground">{transaction.kategori}</p>
            <p className="text-muted-foreground">
              {transaction.tanggal} · {rp(transaction.nominal)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteMutation.isPending}>
            <Trash2 />
            {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </DialogFooter>
      </AnimatedDialogContent>
    </Dialog>
  )
}
