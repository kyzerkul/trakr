'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Save, Plus, Trash2, UserPlus, Loader2, Youtube, ExternalLink } from 'lucide-react'
import { getTeams, getBookmakers, getCommunityManagers, createTeam, createProfile, createBookmaker, deleteTeam, deleteProfile, deleteBookmaker } from '@/lib/data'
import type { Team, Profile, Bookmaker } from '@/lib/types'
import Link from 'next/link'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [teams, setTeams] = useState<Team[]>([])
    const [cms, setCMs] = useState<Profile[]>([])
    const [bookmakers, setBookmakers] = useState<Bookmaker[]>([])

    // Dialog states
    const [newTeamName, setNewTeamName] = useState('')
    const [newCMName, setNewCMName] = useState('')
    const [newCMYoutube, setNewCMYoutube] = useState('')
    const [newBookmakerName, setNewBookmakerName] = useState('')
    const [isAddingTeam, setIsAddingTeam] = useState(false)
    const [isAddingCM, setIsAddingCM] = useState(false)
    const [isAddingBookmaker, setIsAddingBookmaker] = useState(false)
    const [teamDialogOpen, setTeamDialogOpen] = useState(false)
    const [cmDialogOpen, setCMDialogOpen] = useState(false)
    const [bookmakerDialogOpen, setBookmakerDialogOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [teamsData, cmsData, bookmakersData] = await Promise.all([
                getTeams(),
                getCommunityManagers(),
                getBookmakers()
            ])
            setTeams(teamsData)
            setCMs(cmsData)
            setBookmakers(bookmakersData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddTeam() {
        if (!newTeamName.trim()) return
        setIsAddingTeam(true)
        setError(null)
        try {
            await createTeam(newTeamName.trim())
            setNewTeamName('')
            setTeamDialogOpen(false)
            await loadData()
        } catch (err: any) {
            console.error('Error creating team:', err)
            setError(err.message || 'Erreur lors de la création')
        } finally {
            setIsAddingTeam(false)
        }
    }

    async function handleAddCM() {
        if (!newCMName.trim()) return
        setIsAddingCM(true)
        setError(null)
        try {
            await createProfile({
                full_name: newCMName.trim(),
                role: 'cm',
                team_id: null,
                youtube_channel: newCMYoutube.trim() || null
            })
            setNewCMName('')
            setNewCMYoutube('')
            setCMDialogOpen(false)
            await loadData()
        } catch (err: any) {
            console.error('Error creating CM:', err)
            setError(err.message || 'Erreur lors de la création')
        } finally {
            setIsAddingCM(false)
        }
    }

    async function handleAddBookmaker() {
        if (!newBookmakerName.trim()) return
        setIsAddingBookmaker(true)
        setError(null)
        try {
            await createBookmaker(newBookmakerName.trim())
            setNewBookmakerName('')
            setBookmakerDialogOpen(false)
            await loadData()
        } catch (err: any) {
            console.error('Error creating bookmaker:', err)
            setError(err.message || 'Erreur lors de la création')
        } finally {
            setIsAddingBookmaker(false)
        }
    }

    async function handleDeleteTeam(id: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return
        try {
            await deleteTeam(id)
            await loadData()
        } catch (error) {
            console.error('Error deleting team:', error)
        }
    }

    async function handleDeleteCM(id: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce CM ?')) return
        try {
            await deleteProfile(id)
            await loadData()
        } catch (error) {
            console.error('Error deleting CM:', error)
        }
    }

    async function handleDeleteBookmaker(id: string) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce bookmaker ?')) return
        try {
            await deleteBookmaker(id)
            await loadData()
        } catch (error) {
            console.error('Error deleting bookmaker:', error)
        }
    }

    if (loading) {
        return (
            <DashboardLayout title="Settings" subtitle="Manage teams, users, and bookmaker configuration">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Settings" subtitle="Manage teams, users, and bookmaker configuration">
            <Tabs defaultValue="teams" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="teams">Équipes Éditeurs</TabsTrigger>
                    <TabsTrigger value="cms">Community Managers</TabsTrigger>
                    <TabsTrigger value="bookmakers">Bookmakers</TabsTrigger>
                </TabsList>

                {/* Teams Tab */}
                <TabsContent value="teams" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Équipes Éditeurs</CardTitle>
                                    <CardDescription>Gérer vos équipes d'éditeurs ({teams.length} équipes)</CardDescription>
                                </div>
                                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter une équipe
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Nouvelle équipe</DialogTitle>
                                            <DialogDescription>Créer une nouvelle équipe d'éditeurs</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div>
                                                <Label>Nom de l'équipe</Label>
                                                <Input
                                                    placeholder="ex: Team Alpha"
                                                    value={newTeamName}
                                                    onChange={(e) => setNewTeamName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                                                />
                                            </div>
                                            {error && <p className="text-sm text-red-500">{error}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Annuler</Button>
                                            <Button onClick={handleAddTeam} disabled={isAddingTeam}>
                                                {isAddingTeam && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Créer
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {teams.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Aucune équipe. Ajoutez votre première équipe !</p>
                            ) : (
                                <div className="space-y-3">
                                    {teams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                        >
                                            <Link href={`/teams/${team.id}`} className="flex items-center gap-3 flex-1">
                                                <Avatar>
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {team.name.split(' ').pop()?.charAt(0) || 'T'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground hover:text-primary transition-colors">{team.name}</p>
                                                    <p className="text-sm text-muted-foreground">Équipe Éditeur</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">Active</Badge>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTeam(team.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CMs Tab */}
                <TabsContent value="cms" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Community Managers</CardTitle>
                                    <CardDescription>Gérer vos community managers ({cms.length} CMs)</CardDescription>
                                </div>
                                <Dialog open={cmDialogOpen} onOpenChange={setCMDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Ajouter un CM
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Nouveau Community Manager</DialogTitle>
                                            <DialogDescription>Créer un nouveau profil CM</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div>
                                                <Label>Nom complet</Label>
                                                <Input
                                                    placeholder="ex: Sarah Jenkins"
                                                    value={newCMName}
                                                    onChange={(e) => setNewCMName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="flex items-center gap-2">
                                                    <Youtube className="h-4 w-4 text-red-500" />
                                                    Chaîne YouTube
                                                </Label>
                                                <Input
                                                    placeholder="ex: https://youtube.com/@channel"
                                                    value={newCMYoutube}
                                                    onChange={(e) => setNewCMYoutube(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCM()}
                                                />
                                            </div>
                                            {error && <p className="text-sm text-red-500">{error}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setCMDialogOpen(false)}>Annuler</Button>
                                            <Button onClick={handleAddCM} disabled={isAddingCM}>
                                                {isAddingCM && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Ajouter
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {cms.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Aucun CM. Ajoutez votre premier community manager !</p>
                            ) : (
                                <div className="space-y-3">
                                    {cms.map((cm) => (
                                        <div
                                            key={cm.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                        >
                                            <Link href={`/cms/${cm.id}`} className="flex items-center gap-3 flex-1">
                                                <Avatar>
                                                    <AvatarFallback className="bg-green-500 text-white">
                                                        {cm.full_name?.split(' ').map(n => n[0]).join('') || 'CM'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground hover:text-primary transition-colors">{cm.full_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">Community Manager</span>
                                                        {cm.youtube_channel && (
                                                            <a
                                                                href={cm.youtube_channel}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-red-500 hover:text-red-400"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Youtube className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">Active</Badge>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCM(cm.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bookmakers Tab */}
                <TabsContent value="bookmakers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Bookmakers</CardTitle>
                                    <CardDescription>Configurer les partenaires bookmakers ({bookmakers.length} actifs)</CardDescription>
                                </div>
                                <Dialog open={bookmakerDialogOpen} onOpenChange={setBookmakerDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter un bookmaker
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Nouveau bookmaker</DialogTitle>
                                            <DialogDescription>Ajouter un nouveau partenaire bookmaker</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div>
                                                <Label>Nom du bookmaker</Label>
                                                <Input
                                                    placeholder="ex: 1xbet"
                                                    value={newBookmakerName}
                                                    onChange={(e) => setNewBookmakerName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddBookmaker()}
                                                />
                                            </div>
                                            {error && <p className="text-sm text-red-500">{error}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setBookmakerDialogOpen(false)}>Annuler</Button>
                                            <Button onClick={handleAddBookmaker} disabled={isAddingBookmaker}>
                                                {isAddingBookmaker && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                Ajouter
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {bookmakers.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Aucun bookmaker. Ajoutez votre premier bookmaker !</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {bookmakers.map((bm) => (
                                        <div
                                            key={bm.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-sm">
                                                    {bm.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-foreground">{bm.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBookmaker(bm.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}
