'use client'

import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface LeaderboardItem {
    rank: number
    name: string
    initials: string
    registrations: number
    deposits: number
    growth: number
    type: 'team' | 'individual'
}

interface LeaderboardTableProps {
    title: string
    subtitle?: string
    items: LeaderboardItem[]
    showLiveIndicator?: boolean
    viewAllLink?: string
    emptyMessage?: string
}

function getRankIcon(rank: number) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground font-medium">{rank}</span>
}

function getInitialsColor(name: string) {
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-cyan-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}

export function LeaderboardTable({
    title,
    subtitle,
    items,
    showLiveIndicator = false,
    viewAllLink,
    emptyMessage = "Aucune donnée",
}: LeaderboardTableProps) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                {showLiveIndicator && items.length > 0 && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Live
                    </Badge>
                )}
            </div>

            {/* Content */}
            {items.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    {viewAllLink && (
                        <Link href={viewAllLink} className="text-sm text-primary hover:underline mt-2 inline-block">
                            Gérer →
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="px-5 py-3 text-left font-medium">Rang</th>
                                    <th className="px-5 py-3 text-left font-medium">{items[0]?.type === 'team' ? 'Équipe' : 'Manager'}</th>
                                    <th className="px-5 py-3 text-right font-medium">Inscr.</th>
                                    <th className="px-5 py-3 text-right font-medium">Dépôts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.rank}
                                        className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex h-6 w-6 items-center justify-center">
                                                {getRankIcon(item.rank)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className={cn('text-xs font-medium text-white', getInitialsColor(item.name))}>
                                                        {item.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-foreground">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-foreground">
                                            {item.registrations.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-muted-foreground">
                                                    {item.deposits.toLocaleString()}
                                                </span>
                                                {item.growth !== 0 && (
                                                    <span className={cn(
                                                        'text-xs',
                                                        item.growth >= 0 ? 'text-green-400' : 'text-red-400'
                                                    )}>
                                                        {item.growth >= 0 ? '↗' : '↘'} {Math.abs(item.growth).toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {viewAllLink && (
                        <div className="border-t border-border px-5 py-3">
                            <Link
                                href={viewAllLink}
                                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                            >
                                Voir le rapport complet →
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
