import { useState } from 'react'
import { toast } from 'sonner'
import {
  Award,
  Gift,
  Inbox,
  Trash2,
} from 'lucide-react'

import { Providers } from '@/app/providers'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogTrigger,
  AnimatedDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Loading } from '@/components/ui/loading'
import { EmptyState } from '@/components/shared/EmptyState'

/**
 * DesignSystemPreview — HALAMAN SEMENTARA.
 *
 * Ini BUKAN Dashboard, BUKAN halaman fitur apa pun — murni "katalog" yang
 * mendemonstrasikan seluruh Design Token + reusable component dari Tahap
 * 3.2 (Design System & Layout) supaya bisa diverifikasi visual sebelum
 * fitur sungguhan dibangun.
 *
 * Komponen ini akan DIGANTI TOTAL oleh struktur routing (`<Routes>` berisi
 * DashboardPage, TransactionsPage, dst.) begitu Tahap 4 (Routing) dan
 * Tahap 5+ (fitur) dikerjakan.
 */
function DesignSystemPreview() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [progressDemo, setProgressDemo] = useState(68)

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Design System &amp; Layout — Preview
          </h1>
          <p className="text-sm text-muted-foreground">
            Tahap 3.2 selesai. Halaman ini hanya katalog komponen, bukan fitur.
          </p>
        </div>

        {/* ── Button ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>Seluruh varian &amp; ukuran</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">
              <Trash2 />
              Destructive
            </Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline">
              <Gift />
            </Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>

        {/* ── Form: Input, Textarea, Select ──────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input, Textarea, Select</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Input</label>
              <Input placeholder="Nama wishlist..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Input (invalid)</label>
              <Input placeholder="Nominal" invalid defaultValue="abc" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Select</label>
              <Select defaultValue="expense">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="saving">Nabung</SelectItem>
                  <SelectItem value="withdrawal">Tarik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Textarea</label>
              <Textarea placeholder="Keterangan (opsional)..." />
            </div>
          </CardContent>
        </Card>

        {/* ── Badge ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>Semantik &amp; rarity achievement</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="rarity-common">Common</Badge>
            <Badge variant="rarity-uncommon">Uncommon</Badge>
            <Badge variant="rarity-rare">Rare</Badge>
            <Badge variant="rarity-epic">Epic</Badge>
            <Badge variant="rarity-mythic">Mythic</Badge>
            <Badge variant="rarity-artifact">Artifact</Badge>
          </CardContent>
        </Card>

        {/* ── Progress ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Gradient biru → ungu, beranimasi</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Progress value={progressDemo} />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setProgressDemo((v) => Math.max(0, v - 15))}>
                -15%
              </Button>
              <Button size="sm" variant="outline" onClick={() => setProgressDemo((v) => Math.min(100, v + 15))}>
                +15%
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Dialog / Modal ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog / Modal</CardTitle>
            <CardDescription>Primitive yang sama, animasi Framer Motion</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  Hapus (contoh)
                </Button>
              </DialogTrigger>
              <AnimatedDialogContent open={confirmOpen}>
                <DialogHeader>
                  <DialogTitle>Yakin ingin menghapus?</DialogTitle>
                  <DialogDescription>
                    Ini contoh ConfirmDialog generik — tidak terhubung ke data sungguhan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Batal</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setConfirmOpen(false)
                      toast.success('Berhasil dihapus (contoh)')
                    }}
                  >
                    Ya, Hapus
                  </Button>
                </DialogFooter>
              </AnimatedDialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* ── Toast (Sonner) ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Toast (Sonner)</CardTitle>
            <CardDescription>Posisi kanan atas, tema glass gelap</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => toast.success('Transaksi berhasil disimpan')}>
              Sukses
            </Button>
            <Button variant="outline" onClick={() => toast.error('Gagal memuat data')}>
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast('Achievement baru terbuka!', {
                  description: 'Menabung 7 Hari Berturut-turut',
                  icon: <Award className="size-4" />,
                })
              }
            >
              Info + ikon
            </Button>
          </CardContent>
        </Card>

        {/* ── Skeleton & Loading ─────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton &amp; Loading</CardTitle>
            <CardDescription>Pengganti spinner/overlay lama</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Loading label="Memuat data..." />
          </CardContent>
        </Card>

        {/* ── Empty State ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Empty State</CardTitle>
            <CardDescription>Dipakai di semua halaman berlist</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Inbox}
              title="Belum ada transaksi"
              description="Mulai catat pemasukan atau pengeluaranmu untuk melihatnya di sini."
              action={{ label: 'Tambah Transaksi', onClick: () => toast.info('Contoh aksi EmptyState') }}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

/**
 * Root aplikasi.
 *
 * Membungkus AppShell dengan Providers (QueryClientProvider + BrowserRouter
 * + Toaster). `<Routes>` / halaman fitur sungguhan MENYUSUL di Tahap 4 &
 * seterusnya — `DesignSystemPreview` di atas adalah konten sementara agar
 * fondasi UI (Sidebar, Header, MobileTopbar, MobileFab, seluruh komponen
 * dasar) bisa diverifikasi secara visual dan responsif sekarang.
 */
function App() {
  return (
    <Providers>
      <AppShell onFabClick={() => toast.info('FAB ditekan (belum terhubung ke fitur Transaksi)')}>
        <DesignSystemPreview />
      </AppShell>
    </Providers>
  )
}

export default App
