/**
 * types/transaction.ts — sesuai §7 (action #5–8) & §8.
 */

export type TxType = 'INCOME' | 'EXPENSE' | 'SAVING' | 'WITHDRAWAL'

export interface Transaction {
  id: string
  tanggal: string // YYYY-MM-DD
  tipe: TxType
  kategori: string
  nominal: number
  keterangan: string
  target_id: string
}

export interface AddTransactionRequest {
  tanggal: string
  tipe: TxType
  kategori: string
  nominal: number
  keterangan?: string
  target_id?: string
}

export interface AddTransactionResponse {
  id: string
  message: string
  new_achievements: import('./api').AchievementUnlock[]
}

export interface EditTransactionRequest extends Partial<AddTransactionRequest> {
  id: string
}

export interface GetTransactionsRequest {
  tipe?: TxType
  tanggal_mulai?: string
  tanggal_selesai?: string
  limit?: number
  offset?: number
}

export interface GetTransactionsResponse {
  transactions: Transaction[]
  total: number
  limit: number
  offset: number
}

export interface DeleteTransactionRequest {
  id: string
}
