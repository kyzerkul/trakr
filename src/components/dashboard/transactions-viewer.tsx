'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PerformanceEntry, Profile, Team, Bookmaker } from '@/lib/types'

interface TransactionsViewerProps {
    entries: PerformanceEntry[]
    title?: string
    view?: 'table' | 'calendar'
    onViewChange?: (view: 'table' | 'calendar') => void
}

export function TransactionsViewer({ entries, title = "Historique", view: controlledView, onViewChange }: TransactionsViewerProps) {
    const [internalView, setInternalView] = useState<'table' | 'calendar'>('table')
    const [currentDate, setCurrentDate] = useState(new Date())

    const view = controlledView ?? internalView
    const setView = onViewChange ?? setInternalView

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        return Array.from({ length: days }, (_, i) => i + 1)
    }

    const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const daysInMonth = getDaysInMonth(currentDate)

    // Filter entries for current month for calendar view
    const currentMonthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === currentDate.getMonth() &&
            entryDate.getFullYear() === currentDate.getFullYear()
    })

    // Group entries by date for calendar
    const entriesByDate: Record<string, PerformanceEntry[]> = {}
    currentMonthEntries.forEach(entry => {
        if (!entriesByDate[entry.date]) {
            entriesByDate[entry.date] = []
        }
        entriesByDate[entry.date].push(entry)
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium capitalize min-w-[140px] text-center">{monthName}</span>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'calendar')}>
                        <TabsList>
                            <TabsTrigger value="table" className="flex items-center gap-2">
                                <ListIcon className="h-4 w-4" />
                                Tableau
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Calendrier
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {view === 'table' ? (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Entité</TableHead>
                                    <TableHead>Bookmaker</TableHead>
                                    <TableHead className="text-right">Inscriptions</TableHead>
                                    <TableHead className="text-right">Dépôts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentMonthEntries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Aucune donnée pour ce mois
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentMonthEntries
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(entry => (
                                            <TableRow key={entry.id}>
                                                <TableCell>{entry.date}</TableCell>
                                                <TableCell className="font-medium">
                                                    {(entry.team as Team)?.name || (entry.profile as Profile)?.full_name || 'N/A'}
                                                </TableCell>
                                                <TableCell>{(entry.bookmaker as Bookmaker)?.name}</TableCell>
                                                <TableCell className="text-right font-semibold">{entry.registrations}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{entry.deposits}</TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {daysInMonth.map(day => {
                        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                        const dayEntries = entriesByDate[dateStr] || []
                        const dayRegistrations = dayEntries.reduce((sum, e) => sum + (e.registrations || 0), 0)
                        const dayDeposits = dayEntries.reduce((sum, e) => sum + (e.deposits || 0), 0)

                        // Collect both Team names and CM names
                        const entities = Array.from(new Set(dayEntries.map(e => {
                            if (e.team) return (e.team as Team).name
                            if (e.profile) return (e.profile as Profile).full_name
                            return null
                        }).filter(Boolean))) as string[]

                        return (
                            <Card key={day} className={cn(
                                "relative overflow-hidden transition-all hover:shadow-md",
                                dayEntries.length > 0 ? "border-primary/20 bg-primary/5" : "opacity-60 bg-secondary/10"
                            )}>
                                <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0 p-3">
                                    <div className="text-xl font-bold opacity-10 absolute top-1 right-3">{day}</div>
                                    <CardTitle className="text-sm font-medium">
                                        {new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                    {dayEntries.length > 0 ? (
                                        <div className="space-y-1 mt-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground scale-90 origin-left">Inscr.:</span>
                                                <span className="font-semibold">{dayRegistrations}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground scale-90 origin-left">Dépôts:</span>
                                                <span className="font-medium text-muted-foreground">{dayDeposits}</span>
                                            </div>
                                            {entities.length > 0 && (
                                                <div className="pt-1.5 text-[10px] text-muted-foreground border-t border-border/50 mt-1.5 truncate">
                                                    {entities.slice(0, 2).join(', ')}
                                                    {entities.length > 2 && ` +${entities.length - 2}`}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-8"></div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
