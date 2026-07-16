import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import {
  ArrowLeftRight,
  Award,
  BarChart3,
  Calculator,
  Gift,
  History,
  LayoutDashboard,
  PiggyBank,
  PiggyBank as BrandIcon,
  Settings,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { SidebarState } from '@/hooks/useSidebarState'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

/**
 * Daftar navigasi — mengikuti Daftar Halaman (Routes) §3 Final Architecture
 * Specification, tanpa `/login` (halaman publik, di luar AppShell).
 * Path di sini murni untuk keperluan navigasi Sidebar; komponen halaman
 * tujuan (DashboardPage, TransactionsPage, dst.) BELUM dibuat — itu Tahap
 * berikutnya (Routing → Tahap 4, fitur → Tahap 5+).
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Transaksi', path: '/transaksi', icon: ArrowLeftRight },
  { label: 'Nabung & Tarik', path: '/nabung-tarik', icon: PiggyBank },
  { label: 'Wishlist', path: '/wishlist', icon: Gift },
  { label: 'Hall of Fame', path: '/hall-of-fame', icon: Trophy },
  { label: 'Pencapaian', path: '/pencapaian', icon: Award },
  { label: 'Statistik', path: '/statistik', icon: BarChart3 },
  { label: 'Simulator', path: '/simulator', icon: Calculator },
  { label: 'Riwayat', path: '/riwayat', icon: History },
  { label: 'Pengaturan', path: '/pengaturan', icon: Settings },
]

interface SidebarProps {
  sidebar: SidebarState
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
              'transition-all duration-200 ease-out',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )
          }
          title={collapsed ? label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary to-accent"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              )}
              <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4',
        collapsed && 'justify-center px-0',
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-[var(--shadow-soft)]">
        <BrandIcon className="size-5" />
      </div>
      {!collapsed && (
        <span className="truncate font-heading text-sm font-semibold text-foreground">
          Nabung Untuk
          <br />
          Masa Depan
        </span>
      )}
    </div>
  )
}

/**
 * Sidebar — dua mode render:
 *
 * 1. Fixed (desktop & laptop) — bagian dari flex-row AppShell, lebar
 *    berubah antara 260px (expanded) / 72px (collapsed) dengan animasi.
 * 2. Overlay/drawer (tablet & mobile) — position fixed + backdrop,
 *    slide-in dari kiri, dikontrol oleh `sidebar.drawerOpen`.
 */
export function Sidebar({ sidebar }: SidebarProps) {
  const { isOverlayMode, collapsed, drawerOpen, closeDrawer } = sidebar

  if (isOverlayMode) {
    return (
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-drawer-backdrop bg-black/60 backdrop-blur-sm"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="glass-panel fixed inset-y-0 left-0 z-drawer flex w-[260px] flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
            >
              <div className="flex items-center justify-between">
                <SidebarBrand collapsed={false} />
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-4" />
                <span className="sr-only">Tutup menu</span>
              </button>
              <NavList collapsed={false} onNavigate={closeDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="glass-panel sticky top-0 z-sticky flex h-screen shrink-0 flex-col overflow-hidden"
    >
      <SidebarBrand collapsed={collapsed} />
      <NavList collapsed={collapsed} />
    </motion.aside>
  )
}
