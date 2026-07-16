import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Debounce dalam ms sebelum `onChange` dipanggil. Default 300ms. */
  debounceMs?: number
  className?: string
}

/**
 * SearchBox — input pencarian realtime dengan debounce, generik (§4).
 * State lokal (`draft`) supaya ketikan pengguna tidak "lag" menunggu
 * debounce sebelum ter-render di input.
 */
export function SearchBox({
  value,
  onChange,
  placeholder = 'Cari...',
  debounceMs = 300,
  className,
}: SearchBoxProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft)
    }, debounceMs)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('')
            onChange('')
          }}
          className="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <X className="size-4" />
          <span className="sr-only">Bersihkan pencarian</span>
        </button>
      )}
    </div>
  )
}
