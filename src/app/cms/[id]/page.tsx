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
import { ArrowLeft, Youtube, ExternalLink, Loader2, Save, Pencil, X } from 'lucide-react'
import { getProfile, getCMStats, getPerformanceEntries, getCMBookmakerStats, upsertAffiliateLink } from '@/lib/data'
import type { Profile, BookmakerStats } from '@/lib/types'
import Link from 'next/link'

export default function CMDetailPage() {
    const params = useParams()
    const cmId = params.id as string

    const [loading, setLoading] = useState(true)
    const [cm, setCM] = useState<Profile | null>(null)
    const [stats, setStats] = useState({ registrations: 0, deposits: 0, revenue: 0, netRevenue: 0 })
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])
    const [bookmakerStats, setBookmakerStats] = useState<BookmakerStats[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editLink, setEditLink] = useState('')
    const [editCode, setEditCode] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (cmId) loadData()
    }, [cmId])

    async function loadData() {
        setLoading(true)
        try {
            const endDate = new Date().toISOString().split('T')[0]
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const [cmData, cmStats, entries, bmStats] = await Promise.all([
                getProfile(cmId),
                getCMStats(cmId, startDate, endDate),
                getPerformanceEntries({ profileId: cmId, startDate, endDate }),
                getCMBookmakerStats(cmId, startDate, endDate)
            ])

            setCM(cmData)
            setStats(cmStats)
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
                profile_id: cmId,
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
