import {
  AnimatedDialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateWishlist, useUpdateWishlist } from '@/hooks/useWishlist'
import { WishlistForm } from '@/features/wishlist/components/WishlistForm'
import type { CreateWishlistRequest, UpdateWishlistRequest, Wishlist } from '@/types/wishlist'

interface WishlistFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Bila diisi → mode EDIT (update wishlist aktif). Bila `null`/`undefined` → mode TAMBAH. */
  editingWishlist?: Wishlist | null
}

/**
 * WishlistFormDialog — SATU dialog untuk Tambah & Edit Wishlist, sama
 * seperti pola `TransactionFormDialog` (Tahap 3.6) — mode ditentukan oleh
 * ada/tidaknya `editingWishlist`, bukan dua komponen terpisah.
 */
export function WishlistFormDialog({ open, onOpenChange, editingWishlist }: WishlistFormDialogProps) {
  const createMutation = useCreateWishlist()
  const updateMutation = useUpdateWishlist()

  const isEditMode = Boolean(editingWishlist)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(request: CreateWishlistRequest | UpdateWishlistRequest) {
    if (isEditMode) {
      await updateMutation.mutateAsync(request as UpdateWishlistRequest)
    } else {
      await createMutation.mutateAsync(request as CreateWishlistRequest)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Wishlist' : 'Tambah Wishlist'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui nama atau harga target wishlist aktifmu.'
              : 'Buat wishlist baru untuk mulai menabung menuju target impianmu.'}
          </DialogDescription>
        </DialogHeader>

        <WishlistForm
          key={editingWishlist?.id ?? 'create'}
          initialValues={
            editingWishlist
              ? {
                  nama_target: editingWishlist.nama_target,
                  target_nominal: String(editingWishlist.target_nominal),
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Simpan Perubahan' : 'Buat Wishlist'}
        />
      </AnimatedDialogContent>
    </Dialog>
  )
}
