'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, Hash, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTeams, getBookmakers, getCommunityManagers, createPerformanceEntry, getRecentEntries } from '@/lib/data'
import type { Team, Bookmaker, Profile, PerformanceEntry } from '@/lib/types'

export default function DataEntryPage() {
    const [acquisitionType, setAcquisitionType] = useState<'link' | 'code'>('link')
    const [entityType, setEntityType] = useState<'team' | 'cm'>('team')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [teams, setTeams] = useState<Team[]>([])
    const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])
    const [cms, setCMs] = useState<Profile[]>([])
    const [recentEntries, setRecentEntries] = useState<PerformanceEntry[]>([])
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        teamId: '',
        cmId: '',
        bookmakerId: '',
        registrations: '',
        deposits: '',
        grossRevenue: '',
        netRevenue: '',
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [teamsData, bookmakersData, cmsData, entriesData] = await Promise.all([
                getTeams(),
                getBookmakers(),
                getCommunityManagers(),
                getRecentEntries(5)
            ])
            setTeams(teamsData)
            setBookmakers(bookmakersData)
            setCMs(cmsData)
            setRecentEntries(entriesData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent, addAnother: boolean = false) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage(null)

        try {
            // Validate entity selection
            if (entityType === 'team' && !formData.teamId) {
                setMessage({ type: 'error', text: 'Veuillez sélectionner une équipe' })
                setSubmitting(false)
                return
            }
            if (entityType === 'cm' && !formData.cmId) {
                setMessage({ type: 'error', text: 'Veuillez sélectionner un CM' })
                setSubmitting(false)
                return
            }

            if (!formData.bookmakerId) {
                setMessage({ type: 'error', text: 'Veuillez sélectionner un bookmaker' })
                setSubmitting(false)
                return
            }

            const entry = {
                date: formData.date,
                team_id: entityType === 'team' ? formData.teamId : null,
                profile_id: entityType === 'cm' ? formData.cmId : null,
                bookmaker_id: formData.bookmakerId,
                link_identifier: acquisitionType === 'link' ? 'direct_link' : 'promo_code',
                registrations: parseInt(formData.registrations) || 0,
                deposits: parseInt(formData.deposits) || 0,
                revenue: parseFloat(formData.grossRevenue) || 0,
                net_revenue: parseFloat(formData.netRevenue) || 0,
            }

            await createPerformanceEntry(entry)
            setMessage({ type: 'success', text: 'Entry saved successfully!' })

            // Refresh recent entries
            const newEntries = await getRecentEntries(5)
            setRecentEntries(newEntries)

            if (addAnother) {
                setFormData({
                    ...formData,
                    registrations: '',
                    deposits: '',
                    grossRevenue: '',
                    netRevenue: '',
                })
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    teamId: '',
                    cmId: '',
                    bookmakerId: '',
                    registrations: '',
                    deposits: '',
                    grossRevenue: '',
                    netRevenue: '',
                })
            }
        } catch (error) {
            console.error('Error submitting entry:', error)
            setMessage({ type: 'error', text: 'Failed to save entry. Please try again.' })
        } finally {
            setSubmitting(false)
        }
    }

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    if (loading) {
        return (
            <DashboardLayout title="Daily Performance Entry" subtitle={`Recording metrics for ${today}`}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Daily Performance Entry" subtitle={`Recording metrics for ${today}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            {message && (
                                <div className={cn(
                                    'mb-4 p-3 rounded-lg text-sm',
                                    message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                )}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={(e) => handleSubmit(e, false)}>
                                {/* Date Selection */}
                                <div className="mb-6">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                                        Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full max-w-[200px]"
                                        required
                                    />
                                </div>

                                {/* Acquisition Type */}
                                <div className="mb-6">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                                        Type d'acquisition
                                    </Label>
                                    <Tabs value={acquisitionType} onValueChange={(v) => setAcquisitionType(v as 'link' | 'code')}>
                                        <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                                            <TabsTrigger value="link" className="flex items-center gap-2">
                                                <Link2 className="h-4 w-4" />
                                                Lien URL
                                            </TabsTrigger>
                                            <TabsTrigger value="code" className="flex items-center gap-2">
                                                <Hash className="h-4 w-4" />
                                                Code Promo
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Entity Type Selection */}
                                <div className="mb-6">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                                        Type d'entité
                                    </Label>
                                    <Tabs value={entityType} onValueChange={(v) => setEntityType(v as 'team' | 'cm')}>
                                        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                                            <TabsTrigger value="team">Équipe Éditeur</TabsTrigger>
                                            <TabsTrigger value="cm">Community Manager</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {/* Entity & Bookmaker */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {entityType === 'team' ? (
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Équipe
                                            </Label>
                                            <Select
                                                value={formData.teamId}
                                                onValueChange={(v) => setFormData({ ...formData, teamId: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une équipe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teams.length === 0 ? (
                                                        <SelectItem value="none" disabled>Aucune équipe (ajoutez-en dans Settings)</SelectItem>
                                                    ) : (
                                                        teams.map(team => (
                                                            <SelectItem key={team.id} value={team.id}>
                                                                {team.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Community Manager
                                            </Label>
                                            <Select
                                                value={formData.cmId}
                                                onValueChange={(v) => setFormData({ ...formData, cmId: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner un CM" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cms.length === 0 ? (
                                                        <SelectItem value="none" disabled>Aucun CM (ajoutez-en dans Settings)</SelectItem>
                                                    ) : (
                                                        cms.map(cm => (
                                                            <SelectItem key={cm.id} value={cm.id}>
                                                                {cm.full_name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                            Bookmaker
                                        </Label>
                                        <Select
                                            value={formData.bookmakerId}
                                            onValueChange={(v) => setFormData({ ...formData, bookmakerId: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un bookmaker" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bookmakers.length === 0 ? (
                                                    <SelectItem value="none" disabled>Aucun bookmaker</SelectItem>
                                                ) : (
                                                    bookmakers.map(bm => (
                                                        <SelectItem key={bm.id} value={bm.id}>
                                                            {bm.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <Label className="text-sm font-medium">Performance Metrics</Label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Inscriptions
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.registrations}
                                                onChange={(e) => setFormData({ ...formData, registrations: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Dépôts
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.deposits}
                                                onChange={(e) => setFormData({ ...formData, deposits: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Revenu Brut
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    value={formData.grossRevenue}
                                                    onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                                                Revenu Net
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="pl-7"
                                                    value={formData.netRevenue}
                                                    onChange={(e) => setFormData({ ...formData, netRevenue: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        className="flex-1 gradient-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <>
                                                Soumettre & Ajouter un autre
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                    <Button type="submit" variant="secondary" className="flex-1" disabled={submitting}>
                                        Sauvegarder
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Entries Sidebar */}
                <div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Entrées récentes</CardTitle>
                            <a href="#" className="text-sm text-primary hover:underline">Voir tout</a>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Aucune entrée</p>
                            ) : (
                                recentEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="font-medium text-foreground">
                                                {(entry.bookmaker as Bookmaker)?.name || 'Unknown'}
                                            </span>
                                            <span className={cn(
                                                'font-semibold',
                                                entry.net_revenue >= 0 ? 'text-green-400' : 'text-red-400'
                                            )}>
                                                {entry.net_revenue >= 0 ? '+' : ''}${Math.abs(entry.net_revenue).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{(entry.profile as Profile)?.full_name || (entry.team as Team)?.name || 'N/A'}</span>
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                {entry.link_identifier === 'direct_link' ? 'Link' : 'Code'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Tip */}
                    <Card className="mt-4">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">Astuce</p>
                                    <p className="text-xs text-muted-foreground">
                                        Utilisez <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs">Tab</kbd> pour naviguer rapidement entre les champs.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
