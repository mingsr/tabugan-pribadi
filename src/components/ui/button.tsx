import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        // CTA utama — solid electric blue
        default:
          'bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90 active:scale-[0.98]',
        // CTA istimewa — gradient biru → ungu, dipakai jarang & sengaja (mis. aksi utama halaman)
        gradient:
          'bg-gradient-to-r from-primary to-accent text-white shadow-[var(--shadow-soft)] hover:brightness-110 active:scale-[0.98]',
        // Aksi sekunder
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
        // Aksi destruktif (hapus, reset)
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]',
        // Outline tipis di atas background gelap
        outline:
          'border border-white/10 bg-transparent text-foreground hover:bg-white/5 hover:border-white/20 active:scale-[0.98]',
        // Ghost — tanpa border/background, dipakai di sidebar/nav
        ghost: 'bg-transparent text-foreground hover:bg-white/5 active:scale-[0.98]',
        // Link teks
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'size-10 shrink-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
