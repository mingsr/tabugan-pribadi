import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { useSidebarState } from '@/hooks/useSidebarState'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopbar } from '@/components/layout/MobileTopbar'
import { Header } from '@/components/layout/Header'
import { MobileFab } from '@/components/layout/MobileFab'

interface AppShellProps {
  children: ReactNode
  /**
   * Dipanggil saat FAB "+ Tambah Transaksi" ditekan (mobile only).
   * Sengaja opsional dengan fallback no-op — pemasangan sungguhan ke
   * `TransactionFormDialog` terjadi di tahap fitur Transaksi.
   */
  onFabClick?: () => void
}

/**
 * AppShell — Main Layout aplikasi.
 *
 * Struktur (Content Area = `<main>`):
 *
 * Desktop/Laptop (≥1024px) : [ Sidebar fixed | Header + <main> ]  (flex-row)
 * Tablet/Mobile  (<1024px) : [ MobileTopbar (sticky) ]
 *                            [ Sidebar sebagai drawer overlay   ]
 *                            [ <main>                           ]
 *                            [ MobileFab (mobile only)          ]
 *
 * Padding Content Area & grid gap mengikuti §6.3:
 * p-4 (mobile) → p-6 (tablet) → p-8 (desktop), gap-4 → gap-6.
 */
export function AppShell({ children, onFabClick }: AppShellProps) {
  const sidebar = useSidebarState()
  const { isOverlayMode, breakpoint, collapsed, toggleCollapsed, openDrawer } = sidebar

  const isMobile = breakpoint === 'mobile'

  if (isOverlayMode) {
    return (
      <div className="min-h-screen bg-background">
        <MobileTopbar onMenuClick={openDrawer} />
        <Sidebar sidebar={sidebar} />

        <main
          className={cn(
            'mx-auto w-full max-w-[1600px]',
            'grid grid-cols-1 gap-4 p-4', // mobile: grid satu kolom, p-4, gap-4
            'md:gap-6 md:p-6', // tablet: p-6, gap-6
            isMobile && 'pb-24', // ruang ekstra di bawah supaya tidak tertutup FAB
          )}
        >
          {children}
        </main>

        {isMobile && <MobileFab onClick={onFabClick ?? (() => {})} />}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sidebar={sidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header collapsed={collapsed} onToggleCollapse={toggleCollapsed} />

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-8">
          <div className="grid grid-cols-1 gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
