import { useCallback, useEffect, useState } from 'react'

import { useBreakpoint } from '@/hooks/useMediaQuery'

const COLLAPSE_STORAGE_KEY = 'nabung:sidebar-collapsed'

/**
 * useSidebarState — satu sumber kebenaran untuk state Sidebar di seluruh
 * breakpoint, sesuai keputusan final responsive di Master Prompt §2:
 *
 * - Desktop (xl, ≥1280px) : sidebar penuh (expanded) + collapsible manual
 * - Laptop  (lg, ≥1024px) : sidebar collapse (icon-only) SECARA DEFAULT
 * - Tablet  (md, ≥768px)  : sidebar jadi drawer (overlay, tertutup default)
 * - Mobile  (<768px)      : sidebar drawer (overlay, tertutup default)
 *
 * `collapsed`  → dipakai di mode fixed (desktop/laptop): lebar sidebar
 *                260px vs 72px, tanpa overlay.
 * `drawerOpen` → dipakai di mode overlay (tablet/mobile): sidebar
 *                muncul sebagai drawer dengan backdrop.
 */
export function useSidebarState() {
  const breakpoint = useBreakpoint()
  const isOverlayMode = breakpoint === 'mobile' || breakpoint === 'tablet'

  const [manualCollapsed, setManualCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1'
  })

  const [drawerOpen, setDrawerOpen] = useState(false)

  // Laptop: collapse default (kecuali user sudah pernah membuka manual di sesi ini)
  const [laptopAutoCollapsed, setLaptopAutoCollapsed] = useState(true)

  useEffect(() => {
    // Drawer selalu tertutup saat breakpoint berpindah ke mode fixed (desktop/laptop)
    if (!isOverlayMode) {
      setDrawerOpen(false)
    }
  }, [isOverlayMode])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, manualCollapsed ? '1' : '0')
  }, [manualCollapsed])

  const collapsed =
    breakpoint === 'laptop' ? laptopAutoCollapsed : breakpoint === 'desktop' ? manualCollapsed : false

  const toggleCollapsed = useCallback(() => {
    if (breakpoint === 'laptop') {
      setLaptopAutoCollapsed((prev) => !prev)
    } else {
      setManualCollapsed((prev) => !prev)
    }
  }, [breakpoint])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])

  return {
    breakpoint,
    isOverlayMode,
    collapsed,
    toggleCollapsed,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}

export type SidebarState = ReturnType<typeof useSidebarState>
