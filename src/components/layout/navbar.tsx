'use client'

import { Bell, Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface NavbarProps {
    title: string
    subtitle?: string
}

export function Navbar({ title, subtitle }: NavbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
            {/* Title */}
            <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search metrics..."
                        className="w-64 pl-10 bg-secondary border-none"
                    />
                </div>

                {/* Date Range */}
                <Button variant="outline" className="hidden lg:flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last 30 Days
                </Button>

                {/* Notifications */}
                <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                </button>

            </div>
        </header>
    )
}
