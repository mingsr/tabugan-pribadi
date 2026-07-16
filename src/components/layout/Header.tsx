import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface HeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

/**
 * Header — top bar tipis untuk breakpoint laptop & desktop (≥1024px),
 * berisi tombol collapse/expand Sidebar.
 *
 * CATATAN STRUKTUR: file ini TIDAK ada di daftar eksplisit
 * `components/layout/*` pada Final Architecture Specification §2 (yang
 * hanya menyebut AppShell, Sidebar, MobileTopbar, MobileFab,
 * PageTransition). Ditambahkan sebagai file kecil, murni presentasi,
 * mengikuti permintaan eksplisit "Header" pada instruksi Tahap 3.2 ini —
 * bukan penyimpangan arsitektur (tidak menambah route/API/state baru),
 * jadi tidak memerlukan konfirmasi ulang sesuai Master Prompt §8 poin 8
 * ("penyesuaian kecil boleh dilakukan jika ada alasan teknis").
 *
 * Di breakpoint tablet & mobile, peran header sepenuhnya diambil alih oleh
 * `MobileTopbar` (yang sudah ada eksplisit di spesifikasi) — Header ini
 * TIDAK dirender di kedua breakpoint tersebut, lihat AppShell.tsx.
 */
export function Header({ collapsed, onToggleCollapse }: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-sticky flex h-16 shrink-0 items-center gap-3 px-4">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
        title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        <span className="sr-only">{collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}</span>
      </button>

      <div className="h-6 w-px bg-white/10" />

      <p className="font-heading text-sm font-medium text-muted-foreground">
        Nabung Untuk Masa Depan
      </p>
    </header>
  )
}
