import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Pagination — generik, dipakai halaman Transaksi & Riwayat (§4 Reusable
 * Component). Server-side (didorong oleh `limit`/`offset` di `getTransactions`).
 */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ''}`}>
      <p className="text-xs text-muted-foreground">
        Halaman <span className="font-medium text-foreground">{page}</span> dari {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Selanjutnya
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
