'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    change?: number
    icon?: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    variant?: 'default' | 'success' | 'warning' | 'danger'
    sparklineData?: number[]
}

export function StatCard({
    title,
    value,
    change,
    icon: Icon,
    trend = 'neutral',
    variant = 'default',
    sparklineData,
}: StatCardProps) {
    const variantColors = {
        default: 'from-blue-500/20 to-blue-600/10',
        success: 'from-green-500/20 to-green-600/10',
        warning: 'from-amber-500/20 to-amber-600/10',
        danger: 'from-red-500/20 to-red-600/10',
    }

    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-muted-foreground',
    }

    return (
        <div className={cn(
            'relative overflow-hidden rounded-xl border border-border bg-card p-5',
            'transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
        )}>
            {/* Background gradient */}
            <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                variantColors[variant]
            )} />

            <div className="relative">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                    {change !== undefined && change !== 0 && (
                        <div className={cn('flex items-center gap-1 text-xs font-medium', trendColors[trend])}>
                            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                            {trend === 'neutral' && <Minus className="h-3 w-3" />}
                            {change > 0 ? '+' : ''}{change}%
                        </div>
                    )}
                </div>

                <div className="mt-2 flex items-end justify-between">
                    <p className="text-2xl font-bold text-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {Icon && (
                        <Icon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                </div>

                {/* Mini sparkline - only show if there's data */}
                {sparklineData && sparklineData.some(v => v > 0) && (
                    <div className="mt-3 flex items-end gap-0.5 h-8">
                        {sparklineData.map((val, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex-1 rounded-t bg-primary/40',
                                    i === sparklineData.length - 1 && 'bg-primary'
                                )}
                                style={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
