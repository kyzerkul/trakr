'use client'

import { DonutChart } from '@/components/dashboard/donut-chart'
import type { BookmakerStats } from '@/lib/types'

interface BookmakerDistributionChartProps {
    stats: BookmakerStats[]
}

export function BookmakerDistributionChart({ stats }: BookmakerDistributionChartProps) {
    // Top 5 Bookmakers by Registrations (instead of Net Revenue)
    const topBookmakers = [...stats]
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5)

    const totalRegistrations = stats.reduce((sum, s) => sum + s.registrations, 0) || 1 // Avoid div by zero

    const chartSegments = topBookmakers.map((stat, index) => {
        // Generate colors (emerald palette)
        const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

        return {
            label: stat.bookmaker.name,
            value: Math.max(0, stat.registrations),
            color: colors[index % colors.length]
        }
    })

    return (
        <DonutChart
            title="Répartition par Bookmaker"
            subtitle="Top 5 en inscriptions"
            value={totalRegistrations}
            maxValue={totalRegistrations}
            segments={chartSegments}
            size={200}
        />
    )
}
