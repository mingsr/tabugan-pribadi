import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreateWishlistRequest, UpdateWishlistRequest } from '@/types/wishlist'

export interface WishlistFormValues {
  nama_target: string
  target_nominal: string // string di form, dikonversi ke number saat submit
}

interface FormErrors {
  nama_target?: string
  target_nominal?: string
}

interface WishlistFormProps {
  initialValues?: Partial<WishlistFormValues>
  onSubmit: (request: CreateWishlistRequest | UpdateWishlistRequest) => Promise<void> | void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}

const DEFAULT_VALUES: WishlistFormValues = {
  nama_target: '',
  target_nominal: '',
}

/**
 * WishlistForm — field PERSIS sesuai kontrak `createTarget`/`updateTarget`
 * (§7/§8: `{ nama_target, target_nominal }`). TIDAK ada field "Catatan"
 * atau "Target Date" — keduanya diminta di instruksi Tahap 3.7 tapi TIDAK
 * ada di kontrak backend manapun (§8 `CreateWishlistRequest`/
 * `UpdateWishlistRequest`). Menambahkannya di form tanpa backend yang
 * menyimpannya akan menyesatkan pengguna (isi field hilang begitu
 * disimpan) — sengaja tidak ditambahkan, lihat catatan di laporan akhir.
 */
export function WishlistForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: WishlistFormProps) {
  const [values, setValues] = useState<WishlistFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const nextErrors: FormErrors = {}
    const nominalNumber = Number(values.target_nominal)

    if (!values.nama_target.trim()) nextErrors.nama_target = 'Nama wishlist wajib diisi.'
    if (!values.target_nominal || Number.isNaN(nominalNumber) || nominalNumber <= 0) {
      nextErrors.target_nominal = 'Harga target wajib diisi dan harus lebih dari 0.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return // prevent double submit
    if (!validate()) return

    await onSubmit({
      nama_target: values.nama_target.trim(),
      target_nominal: Number(values.target_nominal),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="wishlist-nama" className="text-xs font-medium text-muted-foreground">
          Nama Wishlist
        </label>
        <Input
          id="wishlist-nama"
          placeholder="mis. Laptop Baru, Liburan ke Bali..."
          disabled={isSubmitting}
          invalid={Boolean(errors.nama_target)}
          value={values.nama_target}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, nama_target: e.target.value }))
            if (errors.nama_target) setErrors((prev) => ({ ...prev, nama_target: undefined }))
          }}
        />
        {errors.nama_target && <p className="text-xs text-destructive">{errors.nama_target}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="wishlist-nominal" className="text-xs font-medium text-muted-foreground">
          Harga Target (Rp)
        </label>
        <Input
          id="wishlist-nominal"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="0"
          disabled={isSubmitting}
          invalid={Boolean(errors.target_nominal)}
          value={values.target_nominal}
          onChange={(e) => {
            setValues((prev) => ({ ...prev, target_nominal: e.target.value }))
            if (errors.target_nominal) setErrors((prev) => ({ ...prev, target_nominal: undefined }))
          }}
        />
        {errors.target_nominal && <p className="text-xs text-destructive">{errors.target_nominal}</p>}
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
