'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Download, Filter, Users, Wallet, Loader2 } from 'lucide-react'
import { getDashboardStats, getTeamPerformance, getCMPerformance, getBookmakers } from '@/lib/data'
import type { DashboardStats, Bookmaker } from '@/lib/types'

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true)
    const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalRegistrations: 0,
        totalDeposits: 0,
    })
    const [teamsData, setTeamsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; growth: number; type: 'team' }[]>([])
    const [cmsData, setCMsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; growth: number; type: 'individual' }[]>([])
    const [selectedBookmaker, setSelectedBookmaker] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [statsData, teamPerf, cmPerf, bms] = await Promise.all([
                getDashboardStats(startDate, endDate),
                getTeamPerformance(startDate, endDate),
                getCMPerformance(startDate, endDate),
                getBookmakers()
            ])

            setStats(statsData)
            setBookmakers(bms)

            const transformedTeams = teamPerf.map((t, i) => ({
                rank: i + 1,
                name: t.team.name,
                initials: t.team.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
                registrations: t.registrations,
                deposits: t.deposits,
                growth: t.growth,
                type: 'team' as const,
            }))
            setTeamsData(transformedTeams)

            const transformedCMs = cmPerf.map((c, i) => ({
                rank: i + 1,
                name: c.profile.full_name || 'Unknown',
                initials: (c.profile.full_name || 'UN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
                registrations: c.registrations,
                deposits: c.deposits,
                growth: c.growth,
                type: 'individual' as const,
            }))
            setCMsData(transformedCMs)

        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Classement Performance" subtitle="Suivez les métriques d'acquisition en temps réel">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Classement Performance" subtitle="Inscriptions et dépôts pour les Équipes Éditeurs et Community Managers.">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Période</span>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            30 derniers jours
                        </Button>
                    </div>

                    {/* Bookmaker Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Bookmaker</span>
                        <Select value={selectedBookmaker} onValueChange={setSelectedBookmaker}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les Bookmakers</SelectItem>
                                {bookmakers.map(bm => (
                                    <SelectItem key={bm.id} value={bm.id}>{bm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="gradient-primary">
                        <Filter className="h-4 w-4 mr-2" />
                        Appliquer
                    </Button>
                </div>

                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                </Button>
            </div>

            {/* Leaderboards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <LeaderboardTable
                    title="Top Équipes Éditeurs"
                    items={teamsData.length > 0 ? teamsData : []}
                    showLiveIndicator
                    viewAllLink="/teams"
                    emptyMessage="Aucune équipe. Ajoutez-en dans Settings."
                />
                <LeaderboardTable
                    title="Top Community Managers"
                    items={cmsData.length > 0 ? cmsData : []}
                    viewAllLink="/settings?tab=cms"
                    emptyMessage="Aucun CM. Ajoutez-en dans Settings."
                />
            </div>

            {/* Bottom Summary Stats - Only 2 now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                        <Users className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Inscriptions</p>
                        <p className="text-xl font-bold text-foreground">{stats.totalRegistrations.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <Wallet className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Dépôts</p>
                        <p className="text-xl font-bold text-foreground">{stats.totalDeposits.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
