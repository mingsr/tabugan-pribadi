import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  /** Slot aksi kanan, mis. tombol "Tambah" di halaman Transaksi nanti. */
  action?: ReactNode
  className?: string
}

/**
 * PageHeader — judul halaman + subtitle + breadcrumb + slot aksi kanan.
 * Dipakai SEMUA halaman (§4 Reusable Component).
 *
 * Breadcrumb merender `<Link>` sungguhan bila `href` diberikan (berguna
 * sekarang bahwa lebih dari satu halaman terproteksi ada, sejak Tahap 3.6)
 * — item terakhir (tanpa `href`, halaman aktif) tetap teks biasa.
 */
export function PageHeader({ title, subtitle, breadcrumb, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1
            return (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="size-3.5" />}
                {item.href && !isLast ? (
                  <Link to={item.href} className="transition-colors duration-150 hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-foreground' : undefined}>{item.label}</span>
                )}
              </span>
            )
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
