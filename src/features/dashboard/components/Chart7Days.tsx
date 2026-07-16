import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDateShort, rp } from '@/lib/format'
import type { DailyChartPoint } from '@/types/dashboard'
import { BarChart3 } from 'lucide-react'

interface Chart7DaysProps {
  data: DailyChartPoint[]
}

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="glass-panel rounded-lg px-3 py-2 shadow-[var(--shadow-soft)]">
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {typeof label === 'string' ? formatDateShort(label) : label}
      </p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {rp(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  )
}

/**
 * Chart7Days — grafik 7 hari terakhir (Recharts `AreaChart`, gradient line
 * untuk "saving"). Data dari `DashboardData.chart_7days` (§8) — tidak ada
 * fetch tambahan.
 */
export function Chart7Days({ data }: Chart7DaysProps) {
  const hasData = useMemo(() => data.some((d) => d.income || d.expense || d.saving), [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title="Belum ada data untuk ditampilkan"
            description="Grafik akan terisi seiring transaksi yang kamu catat."
          />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(212 100% 55%)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(271 91% 65%)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="savingLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(212 100% 55%)" />
                    <stop offset="100%" stopColor="hsl(271 91% 65%)" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" vertical={false} />
                <XAxis
                  dataKey="tanggal"
                  tickFormatter={(value: string) => formatDateShort(value)}
                  tick={{ fill: 'hsl(215 20% 60%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(222 30% 18%)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(215 20% 60%)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(value: number) =>
                    value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}jt` : `${value / 1000}rb`
                  }
                />
                <Tooltip content={(props) => <ChartTooltip {...props} />} />

                <Area
                  type="monotone"
                  dataKey="saving"
                  name="Nabung"
                  stroke="url(#savingLine)"
                  strokeWidth={2.5}
                  fill="url(#savingGradient)"
                  isAnimationActive
                  animationDuration={700}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="hsl(152 76% 45%)"
                  strokeWidth={1.5}
                  fill="transparent"
                  isAnimationActive
                  animationDuration={700}
                  animationBegin={100}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="hsl(0 84% 60%)"
                  strokeWidth={1.5}
                  fill="transparent"
                  isAnimationActive
                  animationDuration={700}
                  animationBegin={200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
