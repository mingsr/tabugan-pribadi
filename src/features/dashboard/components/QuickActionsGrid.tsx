import { motion } from 'framer-motion'
import { Calculator, Gift, Minus, Plus, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'

interface QuickActionItem {
  icon: LucideIcon
  label: string
  accent: 'primary' | 'accent' | 'success' | 'danger'
  onClick: (navigate: ReturnType<typeof useNavigate>) => void
}

const ACTIONS: QuickActionItem[] = [
  {
    icon: Plus,
    label: 'Tambah Nabung',
    accent: 'success',
    onClick: (navigate) => navigate('/transaksi', { state: { openAddDialog: true, presetTipe: 'SAVING' } }),
  },
  {
    icon: Minus,
    label: 'Tambah Pengeluaran',
    accent: 'danger',
    onClick: (navigate) => navigate('/transaksi', { state: { openAddDialog: true, presetTipe: 'EXPENSE' } }),
  },
  {
    icon: Gift,
    label: 'Wishlist',
    accent: 'accent',
    onClick: (navigate) => navigate('/wishlist'),
  },
  {
    icon: Calculator,
    label: 'Simulator',
    accent: 'primary',
    onClick: () =>
      toast.info('Halaman "Simulator" belum tersedia', {
        description: 'Akan tersedia di /simulator pada tahap berikutnya.',
      }),
  },
]

const accentClasses: Record<QuickActionItem['accent'], string> = {
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
}

function QuickActionCard({ icon: Icon, label, accent, onClick }: QuickActionItem) {
  const navigate = useNavigate()

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onClick(navigate)}
      className="text-left"
    >
      <Card className="h-full transition-shadow duration-200 hover:shadow-[0_12px_32px_-8px_hsl(212_100%_55%/0.3)]">
        <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:flex-row sm:text-left">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            <Icon className="size-5" />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </CardContent>
      </Card>
    </motion.button>
  )
}

/**
 * QuickActionsGrid — 4 aksi cepat.
 * "Tambah Nabung"/"Tambah Pengeluaran" → `/transaksi` (Tahap 3.6, dengan
 * preset tipe & auto-open dialog). "Wishlist" → `/wishlist` (Tahap 3.7).
 * "Simulator" → belum ada halamannya, tetap toast placeholder.
 */
export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ACTIONS.map((action) => (
        <QuickActionCard key={action.label} {...action} />
      ))}
    </div>
  )
}
