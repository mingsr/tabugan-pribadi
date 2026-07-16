import { PartyPopper } from 'lucide-react'

import {
  AnimatedDialogContent,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCompleteWishlist } from '@/hooks/useWishlist'
import { rp } from '@/lib/format'
import type { Wishlist } from '@/types/wishlist'

interface CompleteWishlistDialogProps {
  wishlist: Wishlist | null
  onOpenChange: (open: boolean) => void
}

/**
 * CompleteWishlistDialog — Confirmation Dialog untuk `completeTarget`.
 *
 * Setelah sukses: `useCompleteWishlist` (Tahap 3.3) SUDAH menangani toast
 * sukses + invalidate `wishlist`, `dashboard`, `hallOfFame`, `achievements`
 * sekaligus — persis sesuai instruksi "refresh Dashboard, Wishlist, Hall
 * of Fame" tanpa perlu ditulis ulang di sini.
 */
export function CompleteWishlistDialog({ wishlist, onOpenChange }: CompleteWishlistDialogProps) {
  const completeMutation = useCompleteWishlist()
  const open = Boolean(wishlist)

  async function handleConfirm() {
    await completeMutation.mutateAsync()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open}>
        <DialogHeader>
          <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-accent">
            <PartyPopper className="size-6" />
          </div>
          <DialogTitle>Selesaikan wishlist ini?</DialogTitle>
          <DialogDescription>
            Wishlist akan dipindahkan ke Hall of Fame dan tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {wishlist && (
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
            <p className="font-medium text-foreground">{wishlist.nama_target}</p>
            <p className="text-muted-foreground">
              Terkumpul {rp(wishlist.total_saving)} dari target {rp(wishlist.target_nominal)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={completeMutation.isPending}>
            Batal
          </Button>
          <Button variant="gradient" onClick={handleConfirm} disabled={completeMutation.isPending}>
            <PartyPopper />
            {completeMutation.isPending ? 'Memproses...' : 'Ya, Selesaikan'}
          </Button>
        </DialogFooter>
      </AnimatedDialogContent>
    </Dialog>
  )
}
