import { callApi } from '@/api/client'
import { ACTIONS } from '@/api/actions'
import type {
  AddTransactionRequest,
  AddTransactionResponse,
  DeleteTransactionRequest,
  EditTransactionRequest,
  GetTransactionsRequest,
  GetTransactionsResponse,
} from '@/types/transaction'
import type { MessageResponse } from '@/types/api'

/**
 * services/transaction.service.ts — action #5–8 (§7): addTransaction,
 * getTransactions, editTransaction, deleteTransaction.
 *
 * Dipakai bersama oleh fitur Transaksi DAN Nabung/Tarik (keduanya memanggil
 * `addTransaction` dengan `tipe` berbeda: 'INCOME'/'EXPENSE' vs
 * 'SAVING'/'WITHDRAWAL') — TIDAK ada service terpisah untuk Nabung/Tarik,
 * sesuai prinsip reusable §5 (hindari duplikasi seperti TransactionTable).
 */

async function addTransaction(request: AddTransactionRequest): Promise<AddTransactionResponse> {
  return callApi<AddTransactionResponse, AddTransactionRequest>(ACTIONS.ADD_TRANSACTION, request)
}

async function getTransactions(
  filters: GetTransactionsRequest = {},
): Promise<GetTransactionsResponse> {
  return callApi<GetTransactionsResponse, GetTransactionsRequest>(
    ACTIONS.GET_TRANSACTIONS,
    filters,
  )
}

async function editTransaction(request: EditTransactionRequest): Promise<MessageResponse> {
  return callApi<MessageResponse, EditTransactionRequest>(ACTIONS.EDIT_TRANSACTION, request)
}

async function deleteTransaction(id: string): Promise<MessageResponse> {
  const request: DeleteTransactionRequest = { id }
  return callApi<MessageResponse, DeleteTransactionRequest>(ACTIONS.DELETE_TRANSACTION, request)
}

export const transactionService = {
  addTransaction,
  getTransactions,
  editTransaction,
  deleteTransaction,
}
