import { useEffect, useState } from 'react'

/**
 * useMediaQuery — subscribe ke satu media query CSS, re-render saat berubah.
 * Dipakai untuk deteksi breakpoint responsif Sidebar (lihat dokumentasi
 * breakpoint di src/styles/globals.css).
 *
 * Contoh: const isDesktop = useMediaQuery('(min-width: 1280px)')
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false

  const [matches, setMatches] = useState<boolean>(getMatch)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQueryList.matches)

    handleChange()
    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

/**
 * Breakpoint query yang dipakai konsisten di seluruh aplikasi.
 * Nilai px SAMA dengan skala default Tailwind v4 (md/lg/xl) — lihat
 * dokumentasi di src/styles/globals.css.
 */
export const BREAKPOINT_QUERY = {
  tablet: '(min-width: 768px)',
  laptop: '(min-width: 1024px)',
  desktop: '(min-width: 1280px)',
} as const

export type BreakpointCategory = 'mobile' | 'tablet' | 'laptop' | 'desktop'

/**
 * useBreakpoint — turunan useMediaQuery yang langsung mengembalikan kategori
 * breakpoint aktif ('mobile' | 'tablet' | 'laptop' | 'desktop').
 */
export function useBreakpoint(): BreakpointCategory {
  const isTablet = useMediaQuery(BREAKPOINT_QUERY.tablet)
  const isLaptop = useMediaQuery(BREAKPOINT_QUERY.laptop)
  const isDesktop = useMediaQuery(BREAKPOINT_QUERY.desktop)

  if (isDesktop) return 'desktop'
  if (isLaptop) return 'laptop'
  if (isTablet) return 'tablet'
  return 'mobile'
}
