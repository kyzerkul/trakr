'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, Pencil, X, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react'
import type { BookmakerStats } from '@/lib/types'
import { upsertAffiliateLink } from '@/lib/data'

interface BookmakerLinksManagerProps {
    stats: BookmakerStats[]
    entityId: string
    entityType: 'team' | 'profile'
    onUpdate: () => void
}

export function BookmakerLinksManager({ stats, entityId, entityType, onUpdate }: BookmakerLinksManagerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editLink, setEditLink] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSave(bookmakerId: string) {
        setSaving(true)
        try {
            await upsertAffiliateLink({
                team_id: entityType === 'team' ? entityId : null,
                profile_id: entityType === 'profile' ? entityId : null,
                bookmaker_id: bookmakerId,
                affiliate_link: editLink || null
            })
            await onUpdate()
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
    }

    return (
        <Card className="border-dashed">
            <CardHeader className="py-4 cursor-pointer hover:bg-secondary/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Configuration des Liens</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
                {!isOpen && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Gérer les liens d'affiliation pour {stats.length} bookmakers
                    </p>
                )}
            </CardHeader>

            {isOpen && (
                <CardContent className="pb-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Bookmaker</TableHead>
                                    <TableHead>Lien Affilié</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.map((bm) => (
                                    <TableRow key={bm.bookmaker.id}>
                                        <TableCell className="font-medium">
                                            {bm.bookmaker.name}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === bm.bookmaker.id ? (
                                                <Input
                                                    value={editLink}
                                                    onChange={(e) => setEditLink(e.target.value)}
                                                    placeholder="https://..."
                                                    className="h-8 text-xs"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 max-w-[300px]">
                                                    {bm.affiliateLink ? (
                                                        <a href={bm.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                                            {bm.affiliateLink}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Non configuré</span>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === bm.bookmaker.id ? (
                                                <div className="flex gap-1 justify-end">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSave(bm.bookmaker.id)} disabled={saving}>
                                                        <Save className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(bm)}>
                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
