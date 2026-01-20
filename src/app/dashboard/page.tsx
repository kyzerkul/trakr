'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { LeaderboardTable } from '@/components/dashboard/leaderboard-table'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { DonutChart } from '@/components/dashboard/donut-chart'
import { Users, DollarSign, Wallet, Loader2 } from 'lucide-react'
import { getDashboardStats, getTeamPerformance, getCMPerformance, getPerformanceEntries, getAcquisitionStats } from '@/lib/data'
import type { DashboardStats, TeamPerformance, CMPerformance } from '@/lib/types'

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalRegistrations: 0,
        totalDeposits: 0,
        totalRevenue: 0,
        netProfit: 0,
    })
    const [teamsData, setTeamsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; netRevenue: number; growth: number; type: 'team' }[]>([])
    const [cmsData, setCMsData] = useState<{ rank: number; name: string; initials: string; registrations: number; deposits: number; netRevenue: number; growth: number; type: 'individual' }[]>([])
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])
    const [acquisitionStats, setAcquisitionStats] = useState<{ label: string; value: number; color: string }[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [statsData, teamPerf, cmPerf, entries, acqStats] = await Promise.all([
                getDashboardStats(startDate, endDate),
                getTeamPerformance(startDate, endDate),
                getCMPerformance(startDate, endDate),
                getPerformanceEntries({ startDate, endDate }),
                getAcquisitionStats(startDate, endDate)
            ])

            setStats(statsData)

            // Transform team data for leaderboard - set growth to 0 if no data
            const transformedTeams = teamPerf.map((t, i) => ({
                rank: i + 1,
                name: t.team.name,
                initials: t.team.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
                registrations: t.registrations,
                deposits: t.deposits,
                netRevenue: t.netRevenue,
                growth: t.netRevenue > 0 ? t.growth : 0, // Only show growth if there's actual data
                type: 'team' as const,
            }))
            setTeamsData(transformedTeams)

            // Transform CM data for leaderboard - set growth to 0 if no data
            const transformedCMs = cmPerf.map((c, i) => ({
                rank: i + 1,
                name: c.profile.full_name || 'Unknown',
                initials: (c.profile.full_name || 'UN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
                registrations: c.registrations,
                deposits: c.deposits,
                netRevenue: c.netRevenue,
                growth: c.netRevenue > 0 ? c.growth : 0, // Only show growth if there's actual data
                type: 'individual' as const,
            }))
            setCMsData(transformedCMs)

            // Build chart data from entries
            const dailyData: Record<string, number> = {}
            entries.forEach(entry => {
                const date = entry.date
                dailyData[date] = (dailyData[date] || 0) + Number(entry.net_revenue)
            })

            const chartDataArray = []
            // Create array of last 30 days including today
            for (let i = 29; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                chartDataArray.push({
                    label,
                    value: dailyData[dateStr] || 0
                })
            }
            setChartData(chartDataArray)

            // Transform acquisition stats
            const totalRevenue = acqStats.links.revenue + acqStats.codes.revenue
            const linkPct = totalRevenue > 0 ? Math.round((acqStats.links.revenue / totalRevenue) * 100) : 0
            const codePct = totalRevenue > 0 ? Math.round((acqStats.codes.revenue / totalRevenue) * 100) : 0

            setAcquisitionStats([
                { label: 'Lien URL', value: linkPct, color: '#3b82f6' },
                { label: 'Code Promo', value: codePct, color: '#64748b' },
            ])

        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate if there's any data to show growth percentages
    const hasData = stats.totalRevenue > 0 || stats.totalRegistrations > 0

    if (loading) {
        return (
            <DashboardLayout title="Global Dashboard" subtitle="Overview of all acquisition metrics">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Global Dashboard" subtitle="Overview of all acquisition metrics">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Registrations"
                    value={stats.totalRegistrations.toLocaleString()}
                    change={hasData ? 0 : undefined}
                    trend="neutral"
                    variant="success"
                />
                <StatCard
                    title="Total Deposits"
                    value={stats.totalDeposits.toLocaleString()}
                    change={hasData ? 0 : undefined}
                    trend="neutral"
                    variant="default"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    change={hasData ? 0 : undefined}
                    trend="neutral"
                    variant="default"
                />
                <StatCard
                    title="Net Profit"
                    value={`$${stats.netProfit.toLocaleString()}`}
                    change={hasData ? 0 : undefined}
                    trend="neutral"
                    variant="success"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                    <PerformanceChart
                        title="Net Profit Trend"
                        subtitle="Last 30 Days"
                        data={chartData.length > 0 ? chartData : Array.from({ length: 30 }, (_, i) => ({ label: `Day ${i + 1}`, value: 0 }))}
                        height={220}
                    />
                </div>



                <DonutChart
                    title="Source d'acquisition"
                    subtitle="Lien URL vs. Code Promo (Revenu)"
                    value={0}
                    segments={acquisitionStats.length > 0 ? acquisitionStats : [
                        { label: 'Lien URL', value: 50, color: '#3b82f6' },
                        { label: 'Code Promo', value: 50, color: '#64748b' },
                    ]}
                />
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <LeaderboardTable
                    title="Top Editor Teams"
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

            {/* Bottom Stats */}
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
