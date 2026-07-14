import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
    'transition-colors duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        accent: 'border-transparent bg-accent/15 text-accent',
        outline: 'border-white/15 bg-transparent text-foreground',
        success: 'border-transparent bg-success/15 text-success',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        warning: 'border-transparent bg-warning/15 text-warning',
        // Rarity achievement — dipakai lagi persis di features/achievements pada Tahap 3.9
        'rarity-common': 'border-transparent bg-rarity-common/15 text-rarity-common',
        'rarity-uncommon': 'border-transparent bg-rarity-uncommon/15 text-rarity-uncommon',
        'rarity-rare': 'border-transparent bg-rarity-rare/15 text-rarity-rare',
        'rarity-epic': 'border-transparent bg-rarity-epic/15 text-rarity-epic',
        'rarity-mythic': 'border-transparent bg-rarity-mythic/15 text-rarity-mythic',
        'rarity-artifact': 'border-transparent bg-rarity-artifact/15 text-rarity-artifact',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
