export interface Team {
    id: string
    name: string
    created_at: string
}

export interface Profile {
    id: string
    full_name: string
    role: 'admin' | 'editor' | 'cm'
    team_id: string | null
    youtube_channel: string | null
    created_at: string
    team?: Team
}

export interface Bookmaker {
    id: string
    name: string
    active: boolean
    created_at: string
}

export interface AffiliateLink {
    id: string
    team_id: string | null
    profile_id: string | null
    bookmaker_id: string
    affiliate_link: string | null
    promo_code: string | null
    created_at: string
    updated_at: string
    bookmaker?: Bookmaker
}

export interface PerformanceEntry {
    id: string
    date: string
    profile_id: string | null
    team_id: string | null
    bookmaker_id: string
    link_identifier: string | null
    registrations: number
    deposits: number
    revenue: number
    net_revenue: number
    created_at: string
    profile?: Profile
    team?: Team
    bookmaker?: Bookmaker
}

export interface DashboardStats {
    totalRegistrations: number
    totalDeposits: number
    totalRevenue: number
    netProfit: number
}

export interface TeamPerformance {
    team: Team
    registrations: number
    deposits: number
    netRevenue: number
    growth: number
}

export interface CMPerformance {
    profile: Profile
    registrations: number
    deposits: number
    netRevenue: number
    growth: number
}

export interface BookmakerStats {
    bookmaker: Bookmaker
    registrations: number
    deposits: number
    revenue: number
    netRevenue: number
    affiliateLink?: string | null
    promoCode?: string | null
}
