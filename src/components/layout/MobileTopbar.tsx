import { Menu, PiggyBank } from 'lucide-react'

interface MobileTopbarProps {
  onMenuClick: () => void
}

/**
 * MobileTopbar — header sticky khusus breakpoint tablet & mobile (<1024px).
 * Berisi tombol hamburger untuk membuka Sidebar drawer + brand mark.
 * Di breakpoint laptop/desktop, header setara ditangani langsung oleh
 * `AppShell` (lihat komentar di AppShell.tsx).
 */
export function MobileTopbar({ onMenuClick }: MobileTopbarProps) {
  return (
    <header className="glass-panel sticky top-0 z-sticky flex h-14 shrink-0 items-center gap-3 px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
      >
        <Menu className="size-5" />
        <span className="sr-only">Buka menu</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-white">
          <PiggyBank className="size-4" />
        </div>
        <span className="truncate font-heading text-sm font-semibold text-foreground">
          Nabung Untuk Masa Depan
        </span>
      </div>
    </header>
  )
}
