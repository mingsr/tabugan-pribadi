import { useState, type FormEvent } from 'react'
import { Minus, PiggyBank } from 'lucide-react'

import { cn } from '@/lib/utils'
import { todayIso } from '@/lib/format'
import { useWishlist } from '@/hooks/useWishlist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CREATABLE_TX_TYPES } from '@/lib/transaction-meta'
import type { AddTransactionRequest } from '@/types/transaction'

/** Saran kategori per tipe — HANYA saran (datalist, tidak mengikat/divalidasi),
 * karena `kategori` di backend adalah string bebas (§8), bukan enum tertutup. */
const CATEGORY_SUGGESTIONS: Record<(typeof CREATABLE_TX_TYPES)[number], string[]> = {
  SAVING: ['Nabung Rutin', 'Nabung Bonus', 'Nabung Hadiah'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'],
}

export interface TransactionFormValues {
  tipe: (typeof CREATABLE_TX_TYPES)[number]
  tanggal: string
  nominal: string // string di form (input), dikonversi ke number saat submit
  kategori: string
  keterangan: string
}

interface FormErrors {
  tanggal?: string
  nominal?: string
  kategori?: string
}

interface TransactionFormProps {
  initialValues?: Partial<TransactionFormValues>
  onSubmit: (request: AddTransactionRequest) => Promise<void> | void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}

const DEFAULT_VALUES: TransactionFormValues = {
  tipe: 'EXPENSE',
  tanggal: todayIso(),
  nominal: '',
  kategori: '',
  keterangan: '',
}

/**
 * TransactionForm — dipakai `TransactionFormDialog` untuk mode Tambah &
 * Edit (satu implementasi, tidak diduplikasi). Mendukung dua tipe sesuai
 * instruksi eksplisit Tahap 3.6: Nabung (SAVING) & Pengeluaran (EXPENSE).
 *
 * `target_id` untuk tipe Nabung diisi OTOMATIS dari wishlist aktif
 * (`useWishlist()`, hook yang sudah ada sejak Tahap 3.3) — TIDAK ada
 * dropdown pilih wishlist karena aplikasi hanya mendukung SATU wishlist
 * aktif (Keputusan Final). Bila tidak ada wishlist aktif, transaksi Nabung
 * tetap bisa disimpan TANPA `target_id` (field tsb opsional di §8).
 */
export function TransactionForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: TransactionFormProps) {
  const { data: activeWishlist } = useWishlist()

  const [values, setValues] = useState<TransactionFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const nextErrors: FormErrors = {}
    const nominalNumber = Number(values.nominal)

    if (!values.tanggal) nextErrors.tanggal = 'Tanggal wajib diisi.'
    if (!values.nominal || Number.isNaN(nominalNumber) || nominalNumber <= 0) {
      nextErrors.nominal = 'Nominal wajib diisi dan harus lebih dari 0.'
    }
    if (!values.kategori.trim()) nextErrors.kategori = 'Kategori wajib diisi.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return // prevent double submit
    if (!validate()) return

    const request: AddTransactionRequest = {
      tanggal: values.tanggal,
      tipe: values.tipe,
      kategori: values.kategori.trim(),
      nominal: Number(values.nominal),
      keterangan: values.keterangan.trim() || undefined,
      target_id: values.tipe === 'SAVING' ? activeWishlist?.id : undefined,
    }

    await onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Toggle tipe: Nabung / Pengeluaran */}
      <div className="grid grid-cols-2 gap-2">
        {CREATABLE_TX_TYPES.map((tipe) => {
          const isActive = values.tipe === tipe
          const Icon = tipe === 'SAVING' ? PiggyBank : Minus
          return (
            <button
              key={tipe}
              type="button"
              disabled={isSubmitting}
              onClick={() => setValues((prev) => ({ ...prev, tipe }))}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? tipe === 'SAVING'
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-danger/40 bg-danger/15 text-danger'
                  : 'border-white/10 text-muted-foreground hover:bg-white/5',
              )}
            >
              <Icon className="size-4" />
              {tipe === 'SAVING' ? 'Nabung' : 'Pengeluaran'}
            </button>
          )
        })}
      </div>

      {values.tipe === 'SAVING' && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          {activeWishlist
            ? `Akan tertaut ke wishlist aktif: ${activeWishlist.nama_target}`
            : 'Tidak ada wishlist aktif — transaksi tetap disimpan tanpa tertaut ke wishlist.'}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tx-tanggal" className="text-xs font-medium text-muted-foreground">
            Tanggal
          </label>
          <Input
            id="tx-tanggal"
            type="date"
            disabled={isSubmitting}
            invalid={Boolean(errors.tanggal)}
            value={values.tanggal}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, tanggal: e.target.value }))
              if (errors.tanggal) setErrors((prev) => ({ ...prev, tanggal: undefined }))
            }}
          />
          {errors.tanggal && <p className="text-xs text-destructive">{errors.tanggal}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tx-nominal" className="text-xs font-medium text-muted-foreground">
            Nominal (Rp)
          </label>
          <Input
            id="tx-nominal"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="0"
            disabled={isSubmitting}
            invalid={Boolean(errors.nominal)}
            value={values.nominal}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, nominal: e.target.value }))
              if (errors.nominal) setErrors((prev) => ({ ...prev, nominal: undefined }))
            }}
          />
          {errors.nominal && <p className="text-xs text-destructive">{errors.nominal}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tx-kategori" className="text-xs font-medium text-muted-foreground">
          Kategori
        </label>
        <Input
          id="tx-kategori"
          list="tx-kategori-suggestions"
          placeholder="mis. Makanan, Transportasi..."
          disabled={isSubmitting}
          invalid={Boolean(errors.kategori)}
          value={values.kategori}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, kategori: e.target.value }))
            if (errors.kategori) setErrors((prev) => ({ ...prev, kategori: undefined }))
          }}
        />
        <datalist id="tx-kategori-suggestions">
          {CATEGORY_SUGGESTIONS[values.tipe].map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
        {errors.kategori && <p className="text-xs text-destructive">{errors.kategori}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tx-keterangan" className="text-xs font-medium text-muted-foreground">
          Keterangan <span className="text-muted-foreground/60">(opsional)</span>
        </label>
        <Textarea
          id="tx-keterangan"
          rows={3}
          placeholder="Catatan tambahan..."
          disabled={isSubmitting}
          value={values.keterangan}
          onChange={(e) => setValues((prev) => ({ ...prev, keterangan: e.target.value }))}
        />
      </div>

      <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
