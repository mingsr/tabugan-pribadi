import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { transactionService } from '@/services/transaction.service'
import { queryKeys } from '@/lib/query-keys'
import { tokenManager } from '@/lib/token'
import { parseErrorMessage } from '@/api/errors'
import type {
  AddTransactionRequest,
  EditTransactionRequest,
  GetTransactionsRequest,
} from '@/types/transaction'

/**
 * hooks/useTransactions.ts — Hook Layer untuk action #5–8.
 * Dipakai bersama oleh fitur Transaksi, Nabung & Tarik, dan Riwayat
 * (§5 Component Mapping — `TransactionTable` reusable).
 */

export function useTransactions(filters: GetTransactionsRequest = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => transactionService.getTransactions(filters),
    enabled: tokenManager.hasToken(),
  })
}

/**
 * Invalidation setelah mutasi transaksi mengikuti §10: transaksi
 * mempengaruhi dashboard (ringkasan/chart) DAN wishlist aktif (total_saving
 * berubah bila tipe SAVING/WITHDRAWAL) — jadi ketiganya di-invalidate.
 */
function useInvalidateAfterTransactionChange() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.root() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() })
    queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root() })
  }
}

export function useAddTransaction() {
  const invalidate = useInvalidateAfterTransactionChange()

  return useMutation({
    mutationFn: (request: AddTransactionRequest) => transactionService.addTransaction(request),
    onSuccess: () => {
      invalidate()
      toast.success('Transaksi berhasil disimpan')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

export function useEditTransaction() {
  const invalidate = useInvalidateAfterTransactionChange()

  return useMutation({
    mutationFn: (request: EditTransactionRequest) => transactionService.editTransaction(request),
    onSuccess: (response) => {
      invalidate()
      toast.success(response.message || 'Transaksi berhasil diperbarui')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAfterTransactionChange()

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: (response) => {
      invalidate()
      toast.success(response.message || 'Transaksi berhasil dihapus')
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error))
    },
  })
}
