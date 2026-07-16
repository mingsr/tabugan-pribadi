import { SearchBox } from '@/components/shared/SearchBox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TX_TYPE_META } from '@/lib/transaction-meta'
import type { TxType } from '@/types/transaction'

export type TypeFilterValue = TxType | 'ALL'

export interface DateRangeFilter {
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface TransactionFilterBarProps {
  typeOptions: TxType[]
  typeFilter: TypeFilterValue
  onTypeFilterChange: (value: TypeFilterValue) => void
  dateRange: DateRangeFilter
  onDateRangeChange: (range: DateRangeFilter) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
}

/**
 * TransactionFilterBar — filter tipe (server-side, via `getTransactions`
 * `tipe`), rentang tanggal (server-side, via `tanggal_mulai`/`tanggal_selesai`
 * — KEDUANYA memang ada di §8 `GetTransactionsRequest`), dan search
 * realtime.
 *
 * CATATAN PENTING: `GetTransactionsRequest` (§8) TIDAK memiliki field
 * pencarian teks bebas atau filter kategori spesifik — hanya `tipe` dan
 * rentang tanggal yang didukung server. Search box di sini karena itu
 * bekerja secara CLIENT-SIDE (menyaring kategori/keterangan pada data yang
 * SUDAH termuat di halaman saat ini), bukan query ke backend. Ini
 * dikomunikasikan ke pengguna lewat placeholder & helper text agar tidak
 * menyesatkan (mengira pencarian mencakup seluruh data).
 */
export function TransactionFilterBar({
  typeOptions,
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Cari kategori/keterangan (halaman ini)...',
}: TransactionFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={typeFilter === 'ALL' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onTypeFilterChange('ALL')}
          className={cn(typeFilter === 'ALL' && 'ring-1 ring-primary/40')}
        >
          Semua
        </Button>
        {typeOptions.map((tipe) => (
          <Button
            key={tipe}
            type="button"
            variant={typeFilter === tipe ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onTypeFilterChange(tipe)}
            className={cn(typeFilter === tipe && 'ring-1 ring-primary/40')}
          >
            {TX_TYPE_META[tipe].label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.tanggal_mulai ?? ''}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, tanggal_mulai: e.target.value || undefined })
            }
            className="w-full sm:w-auto"
            aria-label="Tanggal mulai"
          />
          <span className="text-sm text-muted-foreground">s/d</span>
          <Input
            type="date"
            value={dateRange.tanggal_selesai ?? ''}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, tanggal_selesai: e.target.value || undefined })
            }
            className="w-full sm:w-auto"
            aria-label="Tanggal selesai"
          />
          {(dateRange.tanggal_mulai || dateRange.tanggal_selesai) && (
            <Button variant="ghost" size="sm" onClick={() => onDateRangeChange({})}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
