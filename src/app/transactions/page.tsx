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
            // Only fetch last 3 months for performance
            const today = new Date()
            const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
            const startDate = threeMonthsAgo.toISOString().split('T')[0]
            const endDate = today.toISOString().split('T')[0]

            const data = await getPerformanceEntries({ startDate, endDate })
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
