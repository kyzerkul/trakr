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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchUserRole(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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

        return () => subscription.unsubscribe()
    }, [])

    async function fetchUserRole(userId: string) {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching role:', error)
                setRole('editor') // Default to editor if error
            } else {
                setRole(data?.role as UserRole)
            }
        } catch (err) {
            console.error('Error fetching role:', err)
            setRole('editor')
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { error: error as Error | null }
    }

    async function signOut() {
        await supabase.auth.signOut()
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
