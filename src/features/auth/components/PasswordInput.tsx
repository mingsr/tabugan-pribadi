import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input, type InputProps } from '@/components/ui/input'

/**
 * PasswordInput — Input password dengan tombol show/hide.
 *
 * Reusable: dipakai LoginForm sekarang, dan akan dipakai lagi oleh
 * ChangePasswordSection di halaman Pengaturan (Tahap 3.13) — dibuat sekali
 * di sini supaya tidak ada duplikasi kode toggle password.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          <span className="sr-only">{visible ? 'Sembunyikan password' : 'Tampilkan password'}</span>
        </button>
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
