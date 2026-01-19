'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface DataPoint {
    label: string
    value: number
}

interface PerformanceChartProps {
    title: string
    subtitle?: string
    data: DataPoint[]
    color?: string
    showGrid?: boolean
    height?: number
}

export function PerformanceChart({
    title,
    subtitle,
    data,
    color = '#3b82f6',
    showGrid = true,
    height = 200,
}: PerformanceChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value))
    const paddedMax = maxValue * 1.2

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            {/* Header */}
            <div className="mb-4">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>${(paddedMax / 1000).toFixed(0)}k</span>
                    <span>${((paddedMax * 0.75) / 1000).toFixed(0)}k</span>
                    <span>${((paddedMax * 0.5) / 1000).toFixed(0)}k</span>
                    <span>${((paddedMax * 0.25) / 1000).toFixed(0)}k</span>
                    <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-14 h-full pb-6 relative">
                    {/* Grid lines */}
                    {showGrid && (
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="border-t border-border/30" />
                            ))}
                        </div>
                    )}

                    {/* Bars */}
                    <div className="relative h-full flex items-end gap-1">
                        {data.map((point, i) => (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-1"
                            >
                                <div
                                    className={cn(
                                        'w-full rounded-t transition-all duration-300 hover:opacity-80',
                                        'bg-gradient-to-t from-primary to-primary/60'
                                    )}
                                    style={{
                                        height: `${(point.value / paddedMax) * 100}%`,
                                        minHeight: point.value > 0 ? 4 : 0,
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground -mb-5">
                        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((point, i) => (
                            <span key={i}>{point.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Net Revenue</span>
                </div>
            </div>
        </div>
    )
}
