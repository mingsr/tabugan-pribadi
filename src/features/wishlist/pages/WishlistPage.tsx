import { useState } from 'react'
import { AlertTriangle, Gift, Plus } from 'lucide-react'

import { useWishlist } from '@/hooks/useWishlist'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageTransition } from '@/components/layout/PageTransition'

import { WishlistCard } from '@/features/wishlist/components/WishlistCard'
import { WishlistFormDialog } from '@/features/wishlist/components/WishlistFormDialog'
import { CompleteWishlistDialog } from '@/features/wishlist/components/CompleteWishlistDialog'
import type { Wishlist } from '@/types/wishlist'

/** Skeleton loading — bentuk kartu Wishlist, BUKAN spinner. */
function WishlistSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * WishlistPage — route `/wishlist` (§11). Hanya SATU wishlist aktif
 * ditampilkan (Keputusan Final Arsitektur) — bukan grid/list multi-item.
 *
 * `deleteTarget` TIDAK ada di kontrak backend (§7 hanya 20 action: getTarget,
 * createTarget, updateTarget, completeTarget, getHallOfFame) — jadi TIDAK
 * ada aksi "Hapus Wishlist" di halaman ini, sesuai instruksi "jika memang
 * didukung backend".
 */
export function WishlistPage() {
  const { data: wishlist, isLoading, isError, refetch, isFetching } = useWishlist()

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null)
  const [completingWishlist, setCompletingWishlist] = useState<Wishlist | null>(null)

  function handleCreate() {
    setEditingWishlist(null)
    setFormDialogOpen(true)
  }

  function handleEdit() {
    if (!wishlist) return
    setEditingWishlist(wishlist)
    setFormDialogOpen(true)
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Wishlist"
          subtitle="Satu target tabungan aktif, fokus penuh menuju impianmu"
          breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Wishlist' }]}
          action={
            !wishlist && !isLoading ? (
              <Button variant="gradient" onClick={handleCreate}>
                <Plus />
                Buat Wishlist
              </Button>
            ) : undefined
          }
        />

        {isLoading && <WishlistSkeleton />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="font-medium text-foreground">Gagal memuat wishlist</p>
              <p className="text-sm text-muted-foreground">
                Periksa koneksi internetmu, lalu coba lagi.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Mencoba lagi...' : 'Coba Lagi'}
            </Button>
          </div>
        )}

        {!isLoading && !isError && !wishlist && (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Gift}
                title="Belum ada wishlist aktif"
                description="Buat wishlist untuk mulai menabung menuju target impianmu. Aplikasi ini hanya mendukung satu wishlist aktif dalam satu waktu."
                action={{ label: 'Buat Wishlist', onClick: handleCreate }}
              />
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && wishlist && (
          <WishlistCard
            wishlist={wishlist}
            onEdit={handleEdit}
            onComplete={() => setCompletingWishlist(wishlist)}
          />
        )}

        <WishlistFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          editingWishlist={editingWishlist}
        />

        <CompleteWishlistDialog
          wishlist={completingWishlist}
          onOpenChange={(open) => {
            if (!open) setCompletingWishlist(null)
          }}
        />
      </div>
    </PageTransition>
  )
}
