'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Loader2, Save, Pencil, X } from 'lucide-react'
import { getTeam, getTeamStats, getPerformanceEntries, getTeamBookmakerStats, upsertAffiliateLink } from '@/lib/data'
import type { Team, BookmakerStats } from '@/lib/types'
import Link from 'next/link'

export default function TeamDetailPage() {
    const params = useParams()
    const teamId = params.id as string

    const [loading, setLoading] = useState(true)
    const [team, setTeam] = useState<Team | null>(null)
    const [stats, setStats] = useState({ registrations: 0, deposits: 0, revenue: 0, netRevenue: 0 })
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])
    const [bookmakerStats, setBookmakerStats] = useState<BookmakerStats[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editLink, setEditLink] = useState('')
    const [editCode, setEditCode] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (teamId) loadData()
    }, [teamId])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [teamData, teamStats, entries, bmStats] = await Promise.all([
                getTeam(teamId),
                getTeamStats(teamId, startDate, endDate),
                getPerformanceEntries({ teamId, startDate, endDate }),
                getTeamBookmakerStats(teamId, startDate, endDate)
            ])

            setTeam(teamData)
            setStats(teamStats)
            setBookmakerStats(bmStats)

            // Build chart data
            const dailyData: Record<string, number> = {}
            entries.forEach(entry => {
                dailyData[entry.date] = (dailyData[entry.date] || 0) + Number(entry.net_revenue)
            })

            const chartDataArray = []
            for (let i = 29; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toISOString().split('T')[0]
                chartDataArray.push({
                    label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
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

    async function handleSaveLink(bookmakerId: string) {
        setSaving(true)
        try {
            await upsertAffiliateLink({
                team_id: teamId,
                bookmaker_id: bookmakerId,
                affiliate_link: editLink || null,
                promo_code: editCode || null
            })
            await loadData()
            setEditingId(null)
        } catch (error) {
            console.error('Error saving link:', error)
        } finally {
            setSaving(false)
        }
    }

    function startEdit(bm: BookmakerStats) {
        setEditingId(bm.bookmaker.id)
        setEditLink(bm.affiliateLink || '')
        setEditCode(bm.promoCode || '')
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

            {/* Chart */}
            <div className="mb-8">
                <PerformanceChart
                    title="Évolution du revenu net"
                    subtitle="30 derniers jours"
                    data={chartData}
                    height={200}
                />
            </div>

            {/* Performance by Bookmaker */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance par Bookmaker</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bookmaker</TableHead>
                                <TableHead className="text-right">Inscriptions</TableHead>
                                <TableHead className="text-right">Dépôts</TableHead>
                                <TableHead className="text-right">Revenu Net</TableHead>
                                <TableHead>Lien Affilié</TableHead>
                                <TableHead>Code Promo</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookmakerStats.map((bm) => (
                                <TableRow key={bm.bookmaker.id}>
                                    <TableCell className="font-medium">{bm.bookmaker.name}</TableCell>
                                    <TableCell className="text-right">{bm.registrations}</TableCell>
                                    <TableCell className="text-right">{bm.deposits}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-500">${bm.netRevenue.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {editingId === bm.bookmaker.id ? (
                                            <Input
                                                value={editLink}
                                                onChange={(e) => setEditLink(e.target.value)}
                                                placeholder="https://..."
                                                className="h-8"
                                            />
                                        ) : (
                                            <span className="text-sm text-muted-foreground">{bm.affiliateLink || '—'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === bm.bookmaker.id ? (
                                            <Input
                                                value={editCode}
                                                onChange={(e) => setEditCode(e.target.value)}
                                                placeholder="CODE123"
                                                className="h-8"
                                            />
                                        ) : (
                                            <code className="text-sm text-primary">{bm.promoCode || '—'}</code>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === bm.bookmaker.id ? (
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => handleSaveLink(bm.bookmaker.id)} disabled={saving}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => startEdit(bm)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}
