'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
    LayoutDashboard,
    Trophy,
    FileText,
    Users,
    Settings,
    LogOut,
    BarChart3,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { user, role, signOut, isAdmin } = useAuth()

    // Menu items based on role
    const mainMenuItems = isAdmin
        ? [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
            { name: 'Data Entry', href: '/entry', icon: FileText },
            { name: 'Teams & CMs', href: '/teams', icon: Users },
        ]
        : [
            // Editor only sees Data Entry
            { name: 'Data Entry', href: '/entry', icon: FileText },
        ]

    const settingsItems = isAdmin
        ? [{ name: 'Settings', href: '/settings', icon: Settings }]
        : []

    async function handleLogout() {
        await signOut()
        router.push('/login')
    }

    const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U'
    const userName = user?.email?.split('@')[0] || 'User'

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Trakr</h1>
                    <p className="text-xs text-muted-foreground">
                        {isAdmin ? 'Admin' : 'Éditeur'}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Menu Principal
                </p>
                {mainMenuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}

                {settingsItems.length > 0 && (
                    <>
                        <div className="my-4" />
                        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Paramètres
                        </p>
                        {settingsItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </>
                )}
            </nav>

            {/* User Profile */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {isAdmin ? 'Admin' : 'Éditeur'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
