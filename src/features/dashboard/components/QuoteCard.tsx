import { motion } from 'framer-motion'
import { Quote as QuoteIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Quote } from '@/types/dashboard'

interface QuoteCardProps {
  quote?: Quote
  isLoading: boolean
}

/**
 * QuoteCard — quote harian, bagian dari `getDashboard` (field `quote`,
 * §8). TIDAK memanggil action `getQuote` terpisah di sini (itu untuk
 * kebutuhan "quote lain" yang belum diminta di Tahap 3.5 ini).
 */
export function QuoteCard({ quote, isLoading }: QuoteCardProps) {
  if (isLoading) {
    return (
      <Card className="p-1">
        <CardContent className="flex items-start gap-3 p-5">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quote) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
    >
      <Card className="p-1">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <QuoteIcon className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm italic text-foreground">&ldquo;{quote.quote}&rdquo;</p>
            <p className="text-xs text-muted-foreground">— {quote.author}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
