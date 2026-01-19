import { supabase } from './supabase'
import type { Team, Profile, Bookmaker, PerformanceEntry, DashboardStats, TeamPerformance, CMPerformance, AffiliateLink, BookmakerStats } from './types'

// Teams CRUD
export async function getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')

    if (error) throw error
    return data || []
}

export async function getTeam(id: string): Promise<Team | null> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function createTeam(name: string): Promise<Team> {
    const { data, error } = await supabase
        .from('teams')
        .insert({ name })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Profiles CRUD
export async function getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
      *,
      team:teams(*)
    `)
        .order('full_name')

    if (error) throw error
    return data || []
}

export async function getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
      *,
      team:teams(*)
    `)
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function getCommunityManagers(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cm')
        .order('full_name')

    if (error) throw error
    return data || []
}

export async function createProfile(profile: {
    full_name: string
    role: 'admin' | 'editor' | 'cm'
    team_id?: string | null
    youtube_channel?: string | null
}): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProfile(id: string): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Bookmakers CRUD
export async function getBookmakers(): Promise<Bookmaker[]> {
    const { data, error } = await supabase
        .from('bookmakers')
        .select('*')
        .eq('active', true)
        .order('name')

    if (error) throw error
    return data || []
}

export async function createBookmaker(name: string): Promise<Bookmaker> {
    const { data, error } = await supabase
        .from('bookmakers')
        .insert({ name, active: true })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteBookmaker(id: string): Promise<void> {
    const { error } = await supabase
        .from('bookmakers')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Performance Entries
export async function createPerformanceEntry(entry: {
    date: string
    profile_id?: string | null
    team_id?: string | null
    bookmaker_id: string
    link_identifier?: string | null
    registrations?: number
    deposits?: number
    revenue?: number
    net_revenue?: number
}): Promise<PerformanceEntry> {
    const { data, error } = await supabase
        .from('performance_entries')
        .insert(entry)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getPerformanceEntries(filters?: {
    startDate?: string
    endDate?: string
    profileId?: string
    teamId?: string
    bookmarkerId?: string
}): Promise<PerformanceEntry[]> {
    let query = supabase
        .from('performance_entries')
        .select(`
      *,
      profile:profiles(*),
      team:teams(*),
      bookmaker:bookmakers(*)
    `)
        .order('date', { ascending: false })

    if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
    }
    if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
    }
    if (filters?.profileId) {
        query = query.eq('profile_id', filters.profileId)
    }
    if (filters?.teamId) {
        query = query.eq('team_id', filters.teamId)
    }
    if (filters?.bookmarkerId) {
        query = query.eq('bookmaker_id', filters.bookmarkerId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function getRecentEntries(limit: number = 10): Promise<PerformanceEntry[]> {
    const { data, error } = await supabase
        .from('performance_entries')
        .select(`
      *,
      profile:profiles(*),
      team:teams(*),
      bookmaker:bookmakers(*)
    `)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data || []
}

// Dashboard Stats
export async function getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    let query = supabase
        .from('performance_entries')
        .select('registrations, deposits, revenue, net_revenue')

    if (startDate) {
        query = query.gte('date', startDate)
    }
    if (endDate) {
        query = query.lte('date', endDate)
    }

    const { data, error } = await query
    if (error) throw error

    const stats = (data || []).reduce(
        (acc, entry) => ({
            totalRegistrations: acc.totalRegistrations + (entry.registrations || 0),
            totalDeposits: acc.totalDeposits + (entry.deposits || 0),
            totalRevenue: acc.totalRevenue + Number(entry.revenue || 0),
            netProfit: acc.netProfit + Number(entry.net_revenue || 0),
        }),
        { totalRegistrations: 0, totalDeposits: 0, totalRevenue: 0, netProfit: 0 }
    )

    return stats
}

// Team Performance for Leaderboards
export async function getTeamPerformance(startDate?: string, endDate?: string): Promise<TeamPerformance[]> {
    const teams = await getTeams()

    let query = supabase
        .from('performance_entries')
        .select('team_id, registrations, deposits, net_revenue')

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: entries, error } = await query
    if (error) throw error

    const teamStats = teams.map(team => {
        const teamEntries = entries?.filter(e => e.team_id === team.id) || []

        return {
            team,
            registrations: teamEntries.reduce((sum, e) => sum + (e.registrations || 0), 0),
            deposits: teamEntries.reduce((sum, e) => sum + (e.deposits || 0), 0),
            netRevenue: teamEntries.reduce((sum, e) => sum + Number(e.net_revenue || 0), 0),
            growth: 0,
        }
    })

    return teamStats.sort((a, b) => b.netRevenue - a.netRevenue)
}

// CM Performance for Leaderboards
export async function getCMPerformance(startDate?: string, endDate?: string): Promise<CMPerformance[]> {
    const cms = await getCommunityManagers()

    let query = supabase
        .from('performance_entries')
        .select('profile_id, registrations, deposits, net_revenue')

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: entries, error } = await query
    if (error) throw error

    const cmStats = cms.map(cm => {
        const cmEntries = entries?.filter(e => e.profile_id === cm.id) || []

        return {
            profile: cm,
            registrations: cmEntries.reduce((sum, e) => sum + (e.registrations || 0), 0),
            deposits: cmEntries.reduce((sum, e) => sum + (e.deposits || 0), 0),
            netRevenue: cmEntries.reduce((sum, e) => sum + Number(e.net_revenue || 0), 0),
            growth: 0,
        }
    })

    return cmStats.sort((a, b) => b.netRevenue - a.netRevenue)
}

// Get team stats
export async function getTeamStats(teamId: string, startDate?: string, endDate?: string) {
    let query = supabase
        .from('performance_entries')
        .select('registrations, deposits, revenue, net_revenue')
        .eq('team_id', teamId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error

    return (data || []).reduce(
        (acc, entry) => ({
            registrations: acc.registrations + (entry.registrations || 0),
            deposits: acc.deposits + (entry.deposits || 0),
            revenue: acc.revenue + Number(entry.revenue || 0),
            netRevenue: acc.netRevenue + Number(entry.net_revenue || 0),
        }),
        { registrations: 0, deposits: 0, revenue: 0, netRevenue: 0 }
    )
}

// Get CM stats
export async function getCMStats(profileId: string, startDate?: string, endDate?: string) {
    let query = supabase
        .from('performance_entries')
        .select('registrations, deposits, revenue, net_revenue')
        .eq('profile_id', profileId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error

    return (data || []).reduce(
        (acc, entry) => ({
            registrations: acc.registrations + (entry.registrations || 0),
            deposits: acc.deposits + (entry.deposits || 0),
            revenue: acc.revenue + Number(entry.revenue || 0),
            netRevenue: acc.netRevenue + Number(entry.net_revenue || 0),
        }),
        { registrations: 0, deposits: 0, revenue: 0, netRevenue: 0 }
    )
}

// Affiliate Links CRUD
export async function getAffiliateLinks(params: { teamId?: string, profileId?: string }): Promise<AffiliateLink[]> {
    let query = supabase
        .from('affiliate_links')
        .select(`
            *,
            bookmaker:bookmakers(*)
        `)

    if (params.teamId) {
        query = query.eq('team_id', params.teamId)
    }
    if (params.profileId) {
        query = query.eq('profile_id', params.profileId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function upsertAffiliateLink(link: {
    team_id?: string | null
    profile_id?: string | null
    bookmaker_id: string
    affiliate_link?: string | null
    promo_code?: string | null
}): Promise<AffiliateLink> {
    // First try to find existing
    let query = supabase
        .from('affiliate_links')
        .select('id')
        .eq('bookmaker_id', link.bookmaker_id)

    if (link.team_id) {
        query = query.eq('team_id', link.team_id)
    } else if (link.profile_id) {
        query = query.eq('profile_id', link.profile_id)
    }

    const { data: existing } = await query.maybeSingle()

    if (existing) {
        // Update
        const { data, error } = await supabase
            .from('affiliate_links')
            .update({
                affiliate_link: link.affiliate_link,
                promo_code: link.promo_code
            })
            .eq('id', existing.id)
            .select()
            .single()
        if (error) throw error
        return data
    } else {
        // Insert
        const { data, error } = await supabase
            .from('affiliate_links')
            .insert(link)
            .select()
            .single()
        if (error) throw error
        return data
    }
}

// Get stats per bookmaker for a team
export async function getTeamBookmakerStats(teamId: string, startDate?: string, endDate?: string): Promise<BookmakerStats[]> {
    const bookmakers = await getBookmakers()
    const affiliateLinks = await getAffiliateLinks({ teamId })

    let query = supabase
        .from('performance_entries')
        .select('bookmaker_id, registrations, deposits, revenue, net_revenue')
        .eq('team_id', teamId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: entries, error } = await query
    if (error) throw error

    return bookmakers.map(bookmaker => {
        const bookmakerEntries = entries?.filter(e => e.bookmaker_id === bookmaker.id) || []
        const affiliateLink = affiliateLinks.find(l => l.bookmaker_id === bookmaker.id)

        return {
            bookmaker,
            registrations: bookmakerEntries.reduce((sum, e) => sum + (e.registrations || 0), 0),
            deposits: bookmakerEntries.reduce((sum, e) => sum + (e.deposits || 0), 0),
            revenue: bookmakerEntries.reduce((sum, e) => sum + Number(e.revenue || 0), 0),
            netRevenue: bookmakerEntries.reduce((sum, e) => sum + Number(e.net_revenue || 0), 0),
            affiliateLink: affiliateLink?.affiliate_link,
            promoCode: affiliateLink?.promo_code,
        }
    }).sort((a, b) => b.netRevenue - a.netRevenue)
}

// Get stats per bookmaker for a CM
export async function getCMBookmakerStats(profileId: string, startDate?: string, endDate?: string): Promise<BookmakerStats[]> {
    const bookmakers = await getBookmakers()
    const affiliateLinks = await getAffiliateLinks({ profileId })

    let query = supabase
        .from('performance_entries')
        .select('bookmaker_id, registrations, deposits, revenue, net_revenue')
        .eq('profile_id', profileId)

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: entries, error } = await query
    if (error) throw error

    return bookmakers.map(bookmaker => {
        const bookmakerEntries = entries?.filter(e => e.bookmaker_id === bookmaker.id) || []
        const affiliateLink = affiliateLinks.find(l => l.bookmaker_id === bookmaker.id)

        return {
            bookmaker,
            registrations: bookmakerEntries.reduce((sum, e) => sum + (e.registrations || 0), 0),
            deposits: bookmakerEntries.reduce((sum, e) => sum + (e.deposits || 0), 0),
            revenue: bookmakerEntries.reduce((sum, e) => sum + Number(e.revenue || 0), 0),
            netRevenue: bookmakerEntries.reduce((sum, e) => sum + Number(e.net_revenue || 0), 0),
            affiliateLink: affiliateLink?.affiliate_link,
            promoCode: affiliateLink?.promo_code,
        }
    }).sort((a, b) => b.netRevenue - a.netRevenue)
}
