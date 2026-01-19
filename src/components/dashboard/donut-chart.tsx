'use client'

import { cn } from '@/lib/utils'

interface DonutChartProps {
    title: string
    subtitle?: string
    value: number
    maxValue?: number
    segments?: { label: string; value: number; color: string }[]
    size?: number
}

export function DonutChart({
    title,
    subtitle,
    value,
    maxValue = 100,
    segments,
    size = 160,
}: DonutChartProps) {
    const percentage = (value / maxValue) * 100
    const strokeWidth = 12
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    // For segments mode
    if (segments) {
        const total = segments.reduce((acc, s) => acc + s.value, 0)
        let accumulatedPercentage = 0

        return (
            <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-4">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative" style={{ width: size, height: size }}>
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-muted/20"
                            />
                            {/* Segment circles */}
                            {segments.map((segment, i) => {
                                const segmentPercentage = (segment.value / total) * 100
                                const offset = (accumulatedPercentage / 100) * circumference
                                const length = (segmentPercentage / 100) * circumference
                                accumulatedPercentage += segmentPercentage

                                return (
                                    <circle
                                        key={i}
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={segment.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${length} ${circumference - length}`}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-500"
                                    />
                                )
                            })}
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-foreground">
                                {Math.round((segments[0]?.value / total) * 100)}%
                            </span>
                            <span className="text-xs text-muted-foreground">{segments[0]?.label}</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2">
                        {segments.map((segment, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {segment.label} {Math.round((segment.value / total) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Simple percentage mode
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="flex justify-center">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-muted/20"
                        />
                        {/* Progress circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (percentage / 100) * circumference}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#16a34a" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{percentage.toFixed(0)}%</span>
                        <span className="text-xs text-muted-foreground">Avg 24%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
