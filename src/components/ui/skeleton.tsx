import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Skeleton — pengganti spinner/loading-overlay lama.
 * Dipakai per-komponen (bukan overlay blocking) sesuai Component Mapping §5.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse-soft rounded-md bg-white/8',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
