'use client'

import { DonutChart } from '@/components/dashboard/donut-chart'
import type { BookmakerStats } from '@/lib/types'

interface BookmakerDistributionChartProps {
    stats: BookmakerStats[]
}

export function BookmakerDistributionChart({ stats }: BookmakerDistributionChartProps) {
    // Top 5 Bookmakers by Net Revenue
    const topBookmakers = [...stats]
        .sort((a, b) => b.netRevenue - a.netRevenue)
        .slice(0, 5)

    const totalRevenue = stats.reduce((sum, s) => sum + s.netRevenue, 0) || 1 // Avoid div by zero

    const chartSegments = topBookmakers.map((stat, index) => {
        // Generate colors (emerald palette)
        const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

        return {
            label: stat.bookmaker.name,
            value: Math.max(0, stat.netRevenue), // Don't show negative in donut
            color: colors[index % colors.length]
        }
    })

    // If there are others, add an "Others" category?
    // For simplicity, let's just show top 5

    return (
        <DonutChart
            title="Répartition par Bookmaker"
            subtitle="Top 5 en revenu net"
            value={totalRevenue} // Not used in segments mode but required by props
            maxValue={totalRevenue}
            segments={chartSegments}
            size={200}
        />
    )
}
