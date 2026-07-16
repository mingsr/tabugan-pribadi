import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { lastNDaysIso, todayIso } from '@/lib/format'

interface ConsistencyCalendarProps {
  /** `DashboardData.saving_dates` — daftar tanggal (YYYY-MM-DD) yang ada transaksi SAVING. */
  savingDates: string[]
}

const DAYS_SHOWN = 90

/**
 * ConsistencyCalendar — grid 90 hari terakhir bergaya "contribution graph",
 * dark theme, 3 status: Hari Nabung (gradient) / Hari Ini (ring) / Belum
 * Nabung (kotak redup). Data dari `DashboardData.saving_dates` (§8) — tidak
 * ada fetch tambahan.
 */
export function ConsistencyCalendar({ savingDates }: ConsistencyCalendarProps) {
  const today = todayIso()
  const savingSet = useMemo(() => new Set(savingDates), [savingDates])
  const days = useMemo(() => lastNDaysIso(DAYS_SHOWN), [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kalender Konsistensi</CardTitle>
        <p className="text-xs text-muted-foreground">{DAYS_SHOWN} hari terakhir</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(18,minmax(0,1fr))] lg:grid-cols-[repeat(30,minmax(0,1fr))]">
          {days.map((date, index) => {
            const isToday = date === today
            const isSaving = savingSet.has(date)

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.004, 0.3), ease: 'easeOut' }}
                title={date}
                className={cn(
                  'aspect-square rounded-[3px]',
                  isSaving
                    ? 'bg-gradient-to-br from-primary to-accent'
                    : 'bg-white/8',
                  isToday && 'ring-2 ring-offset-1 ring-offset-background ring-foreground/70',
                )}
              />
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-gradient-to-br from-primary to-accent" />
            Hari Nabung
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-white/8" />
            Belum Nabung
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-white/8 ring-2 ring-offset-1 ring-offset-background ring-foreground/70" />
            Hari Ini
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
