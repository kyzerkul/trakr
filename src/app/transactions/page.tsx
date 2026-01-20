'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TransactionsViewer } from '@/components/dashboard/transactions-viewer'
import { getPerformanceEntries } from '@/lib/data'
import type { PerformanceEntry } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function TransactionsPage() {
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<PerformanceEntry[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            // Fetch all entries, let the viewer handle monthly filtering for now?
            // Or better, fetch a wide range like "this year" or "last 3 months".
            // For now, let's fetch last 3 months to be safe and simple.
            // Actually, the viewer handles monthly navigation locally, but expects "entries" passed to it.
            // Ideally the Viewer would request data, but it's a "Viewer".
            // Let's fetch the current month + previous month + next month?
            // To be simple, let's fetch 'everything' or a large window.
            // Re-reading logic: TransactionsViewer takes "entries".
            // Let's fetch YTD + last year?

            const startDate = '2025-01-01' // Start of "project" time roughly
            const endDate = new Date().toISOString().split('T')[0]

            const data = await getPerformanceEntries({ startDate: '2020-01-01', endDate }) // Wide range for history
            setEntries(data)
        } catch (error) {
            console.error('Error loading transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Historique & Transactions" subtitle="Vue d'ensemble des entrées">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <TransactionsViewer entries={entries} />
            )}
        </DashboardLayout>
    )
}
