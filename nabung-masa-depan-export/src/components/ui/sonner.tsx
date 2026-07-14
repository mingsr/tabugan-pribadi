import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

/**
 * Toaster — Sonner ditheme agar konsisten dengan glassmorphism dark blue/ungu.
 * Posisi pindah ke KANAN ATAS sesuai Component Mapping §5
 * (`showToast()` lama → posisi kiri-bawah, di aplikasi baru: kanan-atas).
 *
 * Mount SATU kali di root aplikasi (lihat app/providers.tsx pada Tahap 3.2 ini).
 */
function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast glass-panel rounded-lg border border-white/10 text-foreground shadow-[var(--shadow-soft)]',
          title: 'font-heading text-sm font-semibold',
          description: 'text-xs text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground rounded-md',
          cancelButton: 'bg-secondary text-secondary-foreground rounded-md',
          closeButton: 'border-white/10 bg-background-elevated text-muted-foreground',
        },
      }}
      style={
        {
          '--z-index': 'var(--z-toast)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
