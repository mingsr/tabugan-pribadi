import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Dialog / Modal
 * ----------------------------------------------------------------------
 * Aplikasi ini tidak membedakan "Dialog" dan "Modal" sebagai dua komponen
 * terpisah — keduanya adalah nama untuk primitive yang sama (overlay +
 * konten terpusat, dismiss via backdrop/Escape). Membuat dua implementasi
 * berbeda untuk hal yang identik akan melanggar aturan "reusable, tidak
 * duplikasi" di Master Prompt bagian 5. `Modal` diekspor sebagai alias
 * dari `Dialog` di bagian bawah file ini supaya penamaan di kode
 * pemanggil tetap fleksibel (mis. "ConfirmModal" vs "FormDialog").
 *
 * Animasi enter/exit memakai Framer Motion (bukan tailwindcss-animate)
 * sesuai stack wajib di Master Prompt bagian 4, durasi 200–300ms sesuai §6.6.
 */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const overlayTransition = { duration: 0.2, ease: 'easeOut' as const }
const contentTransition = { duration: 0.25, ease: 'easeOut' as const }

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Sembunyikan tombol close (×) di pojok kanan atas */
  hideCloseButton?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideCloseButton = false, forceMount: _forceMount, ...props }, ref) => {
  return (
    <DialogPortal forceMount>
      <DialogPrimitive.Overlay asChild forceMount>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className="fixed inset-0 z-modal-backdrop bg-black/60 backdrop-blur-sm"
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild forceMount ref={ref} {...props}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={contentTransition}
          className={cn(
            'fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'glass-panel rounded-xl p-6 shadow-[var(--shadow-soft)]',
            'max-h-[90vh] overflow-y-auto',
            className,
          )}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-all duration-200 hover:bg-white/10 hover:text-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
              <X className="size-4" />
              <span className="sr-only">Tutup</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * Wrapper yang menangani AnimatePresence — pakai ini alih-alih <DialogContent>
 * langsung supaya animasi exit benar-benar berjalan sebelum unmount.
 *
 * Contoh:
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogTrigger asChild><Button>Buka</Button></DialogTrigger>
 *   <AnimatedDialogContent open={open}>...</AnimatedDialogContent>
 * </Dialog>
 */
function AnimatedDialogContent({
  open,
  children,
  ...props
}: DialogContentProps & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && <DialogContent {...props}>{children}</DialogContent>}
    </AnimatePresence>
  )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col gap-1.5 text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-heading text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogContent,
  AnimatedDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

// Alias — lihat catatan di atas file. "Modal" bukan komponen terpisah.
export {
  Dialog as Modal,
  DialogTrigger as ModalTrigger,
  AnimatedDialogContent as AnimatedModalContent,
  DialogHeader as ModalHeader,
  DialogFooter as ModalFooter,
  DialogTitle as ModalTitle,
  DialogDescription as ModalDescription,
}
