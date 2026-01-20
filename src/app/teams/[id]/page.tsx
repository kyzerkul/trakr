'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TransactionsViewer } from '@/components/dashboard/transactions-viewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getTeam, getTeamStats, getPerformanceEntries, getTeamBookmakerStats } from '@/lib/data'
import type { Team, PerformanceEntry, BookmakerStats } from '@/lib/types'
import Link from 'next/link'
import { BookmakerLinksManager } from '@/components/dashboard/bookmaker-links-manager'
import { BookmakerDistributionChart } from '@/components/dashboard/bookmaker-distribution-chart'

export default function TeamDetailPage() {
    const params = useParams()
    const teamId = params.id as string

    // Hooks MUST be at the top level
    const [view, setView] = useState<'table' | 'calendar'>('table')
    const [loading, setLoading] = useState(true)
    const [team, setTeam] = useState<Team | null>(null)
    const [stats, setStats] = useState({ registrations: 0, deposits: 0, revenue: 0, netRevenue: 0 })
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])
    const [entries, setEntries] = useState<PerformanceEntry[]>([])
    const [bookmakerStats, setBookmakerStats] = useState<BookmakerStats[]>([])

    useEffect(() => {
        if (teamId) loadData()
    }, [teamId])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [teamData, teamStats, entriesData, bmStats] = await Promise.all([
                getTeam(teamId),
                getTeamStats(teamId, startDate, endDate),
                getPerformanceEntries({ teamId, startDate, endDate }),
                getTeamBookmakerStats(teamId, startDate, endDate)
            ])

            setTeam(teamData)
            setStats(teamStats)
            setEntries(entriesData)
            setBookmakerStats(bmStats)

            // Build chart data
            const dailyData: Record<string, number> = {}
            entriesData.forEach(entry => {
                dailyData[entry.date] = (dailyData[entry.date] || 0) + Number(entry.net_revenue)
            })

            const chartDataArray = []
            for (let i = 29; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]
                const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                chartDataArray.push({
                    label,
                    value: dailyData[dateStr] || 0
                })
            }
            setChartData(chartDataArray)

        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Chargement..." subtitle="">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    if (!team) {
        return (
            <DashboardLayout title="Équipe non trouvée" subtitle="">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Cette équipe n'existe pas.</p>
                    <Link href="/teams">
                        <Button>Retour aux équipes</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={team.name} subtitle="Performance de l'équipe">
            {/* Back button */}
            <Link href="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour aux équipes
            </Link>

            {/* Team Header */}
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                        {team.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
                    <p className="text-muted-foreground">Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Inscriptions" value={stats.registrations} variant="default" />
                <StatCard title="Dépôts" value={stats.deposits} variant="default" />
                <StatCard title="Revenu Brut" value={`$${stats.revenue.toLocaleString()}`} variant="default" />
                <StatCard title="Revenu Net" value={`$${stats.netRevenue.toLocaleString()}`} variant="success" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2/3) - Performance & History (Table Mode) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart */}
                    <PerformanceChart
                        title="Évolution du revenu net"
                        subtitle="30 derniers jours"
                        data={chartData}
                        height={300}
                    />

                    {/* Transactions View (Only if Table) */}
                    {view === 'table' && (
                        <TransactionsViewer
                            entries={entries}
                            view={view}
                            onViewChange={setView}
                        />
                    )}
                </div>

                {/* Right Column (1/3) - Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Distribution Chart */}
                    <BookmakerDistributionChart stats={bookmakerStats} />

                    {/* Links Config */}
                    <BookmakerLinksManager
                        stats={bookmakerStats}
                        entityId={team.id}
                        entityType="team"
                        onUpdate={loadData}
                    />
                </div>
            </div>

            {/* Full Width Transactions View (Only if Calendar) */}
            {view === 'calendar' && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <TransactionsViewer
                        entries={entries}
                        view={view}
                        onViewChange={setView}
                    />
                </div>
            )}
        </DashboardLayout>
    )
}
