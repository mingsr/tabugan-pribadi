import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  /** Pakai gradient biru→ungu (§6.1 gradient-from/to). Default true. */
  gradient?: boolean
}

/**
 * Progress dasar. Untuk kebutuhan spesifik fitur (mis. progress wishlist
 * dengan label persen di dalamnya) akan dibangun sebagai
 * `components/shared/ProgressBarGradient` di atas primitive ini, pada
 * tahap fitur terkait (Wishlist/Dashboard) — bukan di Tahap 3.2 ini.
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, gradient = true, ...props }, ref) => {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={clamped}
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-white/8',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          className={cn(
            'h-full w-full flex-1 rounded-full',
            gradient ? 'bg-gradient-to-r from-primary to-accent' : 'bg-primary',
          )}
          initial={{ x: '-100%' }}
          animate={{ x: `${clamped - 100}%` }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
