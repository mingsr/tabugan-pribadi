import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Helper penggabung className standar shadcn/ui.
 * Menggabungkan clsx (conditional class) + tailwind-merge (dedup conflicting Tailwind class).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
