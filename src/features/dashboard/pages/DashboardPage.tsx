import { AlertTriangle } from 'lucide-react'

import { useDashboard } from '@/hooks/useDashboard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/layout/PageTransition'

import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'
import { GreetingCard } from '@/features/dashboard/components/GreetingCard'
import { QuoteCard } from '@/features/dashboard/components/QuoteCard'
import { QuickActionsGrid } from '@/features/dashboard/components/QuickActionsGrid'
import { FinancialSummaryGrid } from '@/features/dashboard/components/FinancialSummaryGrid'
import { TargetSummaryCard } from '@/features/dashboard/components/TargetSummaryCard'
import { LevelXpCard } from '@/features/dashboard/components/LevelXpCard'
import { StreakCard } from '@/features/dashboard/components/StreakCard'
import { RecentTransactionsCard } from '@/features/dashboard/components/RecentTransactionsCard'
import { RecentAchievements } from '@/features/dashboard/components/RecentAchievements'
import { Chart7Days } from '@/features/dashboard/components/Chart7Days'
import { ConsistencyCalendar } from '@/features/dashboard/components/ConsistencyCalendar'

/**
 * DashboardPage — halaman utama pasca-login (route `/`, lihat app/router.tsx).
 *
 * Susunan section (sesuai instruksi Tahap 3.5, top → bottom):
 * Header (PageHeader) → Greeting → Quick Action → Financial Summary →
 * Wishlist Aktif → Progress & Gamifikasi → Recent Transaction →
 * Achievement Preview → Chart → Consistency Calendar.
 *
 * SATU pemanggilan data: `useDashboard()` (action `getDashboard`, Tahap
 * 3.3) — TIDAK ada fetch langsung di komponen manapun. `RecentTransactionsCard`
 * adalah satu-satunya pengecualian yang memanggil hook lain
 * (`useTransactions`) karena `getDashboard` memang tidak menyertakan daftar
 * transaksi (lihat catatan di komponen tsb).
 */
export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard()

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Dashboard"
          subtitle="Ringkasan progres tabunganmu hari ini"
          breadcrumb={[{ label: 'Dashboard' }]}
        />

        {isLoading && <DashboardSkeleton />}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="font-medium text-foreground">Gagal memuat data Dashboard</p>
              <p className="text-sm text-muted-foreground">
                Periksa koneksi internetmu, lalu coba lagi.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Mencoba lagi...' : 'Coba Lagi'}
            </Button>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Greeting */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <GreetingCard />
            </div>
            <QuoteCard quote={data.quote} isLoading={false} />

            {/* Quick Action */}
            <QuickActionsGrid />

            {/* Financial Summary */}
            <FinancialSummaryGrid data={data} />

            {/* Wishlist Aktif */}
            <TargetSummaryCard target={data.target} />

            {/* Progress & Gamifikasi */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LevelXpCard level={data.level} />
              <StreakCard streak={data.streak} />
            </div>

            {/* Recent Transaction */}
            <RecentTransactionsCard />

            {/* Achievement Preview */}
            <RecentAchievements
              achievements={data.recent_achievements}
              totalAchievements={data.total_achievements}
              unlockedAchievements={data.unlocked_achievements}
            />

            {/* Chart 7 Hari */}
            <Chart7Days data={data.chart_7days} />

            {/* Consistency Calendar */}
            <ConsistencyCalendar savingDates={data.saving_dates} />
          </>
        )}
      </div>
    </PageTransition>
  )
}
