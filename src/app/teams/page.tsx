'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, Plus, Loader2, Users } from 'lucide-react'
import { getTeams, getCommunityManagers } from '@/lib/data'
import type { Team, Profile } from '@/lib/types'
import Link from 'next/link'

export default function TeamsPage() {
    const [loading, setLoading] = useState(true)
    const [teams, setTeams] = useState<Team[]>([])
    const [cms, setCMs] = useState<Profile[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [teamsData, cmsData] = await Promise.all([
                getTeams(),
                getCommunityManagers()
            ])
            setTeams(teamsData)
            setCMs(cmsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Teams & CMs" subtitle="Gérer les équipes et community managers">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Teams & CMs" subtitle="Gérer les équipes et community managers">
            {/* Editor Teams Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Équipes Éditeurs
                    </h2>
                    <Link href="/settings?tab=teams">
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                        </Button>
                    </Link>
                </div>

                {teams.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground mb-3">Aucune équipe créée</p>
                        <Link href="/settings?tab=teams">
                            <Button size="sm">Créer une équipe</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teams.map((team) => (
                            <Link key={team.id} href={`/teams/${team.id}`}>
                                <div className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                                {team.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-foreground">{team.name}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Community Managers Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        Community Managers
                    </h2>
                    <Link href="/settings?tab=cms">
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                        </Button>
                    </Link>
                </div>

                {cms.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center">
                        <p className="text-muted-foreground mb-3">Aucun CM créé</p>
                        <Link href="/settings?tab=cms">
                            <Button size="sm">Ajouter un CM</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cms.map((cm) => (
                            <Link key={cm.id} href={`/cms/${cm.id}`}>
                                <div className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-green-500/50 hover:bg-accent/50 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-green-500/20 text-green-500 font-semibold">
                                                {cm.full_name?.split(' ').map(n => n[0]).join('') || 'CM'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-foreground">{cm.full_name}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </DashboardLayout>
    )
}
