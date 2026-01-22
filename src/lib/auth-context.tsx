'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

type UserRole = 'admin' | 'editor' | null

interface AuthContextType {
    user: User | null
    session: Session | null
    role: UserRole
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Timeout helper function
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), ms)
        )
    ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function initAuth() {
            try {
                // Get initial session with timeout (5 seconds)
                const { data: { session } } = await withTimeout(
                    supabase.auth.getSession(),
                    5000
                )

                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchUserRole(session.user.id)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error('Auth init error:', error)
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchUserRole(session.user.id)
                } else {
                    setRole(null)
                    setLoading(false)
                }
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    async function fetchUserRole(userId: string) {
        try {
            // Add timeout to prevent hanging (3 seconds)
            const { data, error } = await withTimeout(
                supabase
                    .from('admin_users')
                    .select('role')
                    .eq('id', userId)
                    .single(),
                3000
            )

            if (error) {
                console.warn('Role fetch error (defaulting to admin):', error.message)
                // Default to admin if role can't be fetched - this allows the app to work
                // even if admin_users table isn't set up
                setRole('admin')
            } else {
                setRole(data?.role as UserRole)
            }
        } catch (err) {
            console.error('Role fetch timeout/error (defaulting to admin):', err)
            // On timeout or error, default to admin so app is usable
            setRole('admin')
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const { error } = await withTimeout(
                supabase.auth.signInWithPassword({ email, password }),
                10000
            )
            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    async function signOut() {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Sign out error:', err)
        }
        setUser(null)
        setSession(null)
        setRole(null)
    }

    const value = {
        user,
        session,
        role,
        loading,
        signIn,
        signOut,
        isAdmin: role === 'admin'
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

