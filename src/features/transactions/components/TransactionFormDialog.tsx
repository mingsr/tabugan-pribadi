import {
  AnimatedDialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAddTransaction, useEditTransaction } from '@/hooks/useTransactions'
import { TransactionForm } from '@/features/transactions/components/TransactionForm'
import { CREATABLE_TX_TYPES } from '@/lib/transaction-meta'
import type { AddTransactionRequest } from '@/types/transaction'
import type { Transaction } from '@/types/transaction'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Bila diisi → mode EDIT. Bila `null`/`undefined` → mode TAMBAH. */
  editingTransaction?: Transaction | null
  /**
   * Preset tipe SAAT MODE TAMBAH saja (mis. dari Quick Action Dashboard
   * "Tambah Nabung"/"Tambah Pengeluaran" — lihat router.tsx & QuickActionsGrid).
   * Diabaikan bila `editingTransaction` ada.
   */
  createDefaultTipe?: (typeof CREATABLE_TX_TYPES)[number]
}

/**
 * TransactionFormDialog — SATU dialog untuk Tambah & Edit Transaksi (§5:
 * Dialog/Modal sesuai Design System). Mode ditentukan oleh ada/tidaknya
 * `editingTransaction`, bukan dua komponen dialog terpisah.
 */
export function TransactionFormDialog({
  open,
  onOpenChange,
  editingTransaction,
  createDefaultTipe,
}: TransactionFormDialogProps) {
  const addMutation = useAddTransaction()
  const editMutation = useEditTransaction()

  const isEditMode = Boolean(editingTransaction)
  const isSubmitting = addMutation.isPending || editMutation.isPending

  async function handleSubmit(request: AddTransactionRequest) {
    if (isEditMode && editingTransaction) {
      await editMutation.mutateAsync({ id: editingTransaction.id, ...request })
    } else {
      await addMutation.mutateAsync(request)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui detail transaksi di bawah ini.'
              : 'Catat transaksi Nabung atau Pengeluaran baru.'}
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
          key={editingTransaction?.id ?? `create-${createDefaultTipe ?? 'default'}`}
          initialValues={
            editingTransaction
              ? {
                  tipe: editingTransaction.tipe === 'SAVING' ? 'SAVING' : 'EXPENSE',
                  tanggal: editingTransaction.tanggal,
                  nominal: String(editingTransaction.nominal),
                  kategori: editingTransaction.kategori,
                  keterangan: editingTransaction.keterangan ?? '',
                }
              : createDefaultTipe
                ? { tipe: createDefaultTipe }
                : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Simpan Perubahan' : 'Simpan'}
        />
      </AnimatedDialogContent>
    </Dialog>
  )
}
