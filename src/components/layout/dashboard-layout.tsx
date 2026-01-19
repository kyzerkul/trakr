'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { Loader2 } from 'lucide-react'

interface DashboardLayoutProps {
    children: React.ReactNode
    title: string
    subtitle?: string
}

// Routes that require admin access
const adminOnlyRoutes = ['/dashboard', '/leaderboard', '/teams', '/settings']

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { user, role, loading, isAdmin } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading) {
            // Redirect to login if not authenticated
            if (!user) {
                router.push('/login')
                return
            }

            // Check if editor is trying to access admin-only routes
            if (!isAdmin && adminOnlyRoutes.some(route => pathname.startsWith(route))) {
                router.push('/entry')
            }
        }
    }, [user, role, loading, pathname, router, isAdmin])

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Don't render if not authenticated
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-64">
                <Navbar title={title} subtitle={subtitle} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
