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
import { ArrowLeft, Youtube, ExternalLink, Loader2 } from 'lucide-react'
import { getProfile, getCMStats, getPerformanceEntries, getCMBookmakerStats } from '@/lib/data'
import type { Profile, PerformanceEntry, BookmakerStats } from '@/lib/types'
import Link from 'next/link'
import { BookmakerLinksManager } from '@/components/dashboard/bookmaker-links-manager'
import { BookmakerDistributionChart } from '@/components/dashboard/bookmaker-distribution-chart'

export default function CMDetailPage() {
    const params = useParams()
    const cmId = params.id as string

    // Hooks MUST be at the top level
    const [view, setView] = useState<'table' | 'calendar'>('table')
    const [loading, setLoading] = useState(true)
    const [cm, setCM] = useState<Profile | null>(null)
    const [stats, setStats] = useState({ registrations: 0, deposits: 0 })
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])
    const [entries, setEntries] = useState<PerformanceEntry[]>([])
    const [bookmakerStats, setBookmakerStats] = useState<BookmakerStats[]>([])

    useEffect(() => {
        if (cmId) loadData()
    }, [cmId])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [cmData, cmStats, entriesData, bmStats] = await Promise.all([
                getProfile(cmId),
                getCMStats(cmId, startDate, endDate),
                getPerformanceEntries({ profileId: cmId, startDate, endDate }),
                getCMBookmakerStats(cmId, startDate, endDate)
            ])

            setCM(cmData)
            setStats(cmStats)
            setEntries(entriesData)
            setBookmakerStats(bmStats)

            // Build chart data - based on registrations now
            const dailyData: Record<string, number> = {}
            entriesData.forEach(entry => {
                dailyData[entry.date] = (dailyData[entry.date] || 0) + (entry.registrations || 0)
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

    if (!cm) {
        return (
            <DashboardLayout title="CM non trouvé" subtitle="">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Ce community manager n'existe pas.</p>
                    <Link href="/teams">
                        <Button>Retour</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title={cm.full_name || 'CM'} subtitle="Performance du Community Manager">
            {/* Back button */}
            <Link href="/teams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour
            </Link>

            {/* CM Header */}
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-green-500 text-white text-xl font-bold">
                        {cm.full_name?.split(' ').map(n => n[0]).join('') || 'CM'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{cm.full_name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-muted-foreground">Community Manager</span>
                        {cm.youtube_channel && (
                            <a
                                href={cm.youtube_channel}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-red-500 hover:text-red-400 text-sm"
                            >
                                <Youtube className="h-4 w-4" />
                                YouTube
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                </div>
                <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </div>

            {/* Stats - Only 2 now */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard title="Inscriptions" value={stats.registrations} variant="success" />
                <StatCard title="Premiers Dépôts" value={stats.deposits} variant="default" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2/3) - Performance & History (Table Mode) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart */}
                    <PerformanceChart
                        title="Évolution des inscriptions"
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
                        entityId={cm.id}
                        entityType="profile"
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
