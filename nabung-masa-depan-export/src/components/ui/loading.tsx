import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const sizeMap = {
  sm: 'size-4',
  default: 'size-6',
  lg: 'size-10',
} as const

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap
  /** Teks di bawah spinner, mis. "Memuat data..." */
  label?: string
  /** Isi seluruh tinggi container induk & center konten (untuk state loading full-section) */
  fullHeight?: boolean
}

/**
 * Loading — spinner berputar (Lucide `Loader2` + animasi CSS bawaan Tailwind).
 * Dipakai untuk loading state INLINE (tombol, area kecil) atau full-section.
 * Untuk loading state berbentuk "bentuk konten" (kartu, baris tabel), pakai
 * `Skeleton` — bukan komponen ini — sesuai Component Mapping §5.
 */
function Loading({ size = 'default', label, fullHeight = false, className, ...props }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        fullHeight && 'min-h-[240px] w-full',
        className,
      )}
      {...props}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {label && <p className="text-sm">{label}</p>}
      <span className="sr-only">Memuat…</span>
    </div>
  )
}

export { Loading }
