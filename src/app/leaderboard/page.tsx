'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Download, Filter, DollarSign, Users, Wallet, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getDashboardStats, getTeamPerformance, getCMPerformance, getBookmakers } from '@/lib/data'
import type { DashboardStats, Bookmaker } from '@/lib/types'

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true)
    const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalRegistrations: 0,
        totalDeposits: 0,
        totalRevenue: 0,
        netProfit: 0,
    })
    const [teamsData, setTeamsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; netRevenue: number; growth: number; type: 'team' }[]>([])
    const [cmsData, setCMsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; netRevenue: number; growth: number; type: 'individual' }[]>([])
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
                netRevenue: t.netRevenue,
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
                netRevenue: c.netRevenue,
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
            <DashboardLayout title="Performance Leaderboard" subtitle="Track real-time acquisition metrics">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Performance Leaderboard" subtitle="Track real-time acquisition metrics, deposits, and revenue for Editor Teams and Community Managers.">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Date Range</span>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Last 30 Days
                        </Button>
                    </div>

                    {/* Bookmaker Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Bookmaker</span>
                        <Select value={selectedBookmaker} onValueChange={setSelectedBookmaker}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select bookmaker" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookmakers</SelectItem>
                                {bookmakers.map(bm => (
                                    <SelectItem key={bm.id} value={bm.id}>{bm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Acquisition Type */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Acquisition Type</span>
                        <Tabs defaultValue="link">
                            <TabsList>
                                <TabsTrigger value="link">Link</TabsTrigger>
                                <TabsTrigger value="code">Promo Code</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <Button className="gradient-primary">
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                </div>

                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Leaderboards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <LeaderboardTable
                    title="Top Editor Teams"
                    items={teamsData.length > 0 ? teamsData : [
                        { rank: 1, name: 'No data yet', initials: 'ND', registrations: 0, deposits: 0, netRevenue: 0, growth: 0, type: 'team' }
                    ]}
                    showLiveIndicator
                    viewAllLink="/teams"
                />
                <LeaderboardTable
                    title="Top Community Managers"
                    items={cmsData.length > 0 ? cmsData : [
                        { rank: 1, name: 'No data yet', initials: 'ND', registrations: 0, deposits: 0, netRevenue: 0, growth: 0, type: 'individual' }
                    ]}
                    viewAllLink="/teams?type=cm"
                />
            </div>

            {/* Bottom Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                        <p className="text-xl font-bold text-foreground">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                        <Users className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Registrations</p>
                        <p className="text-xl font-bold text-foreground">{stats.totalRegistrations.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <Wallet className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Deposits</p>
                        <p className="text-xl font-bold text-foreground">{stats.totalDeposits.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
