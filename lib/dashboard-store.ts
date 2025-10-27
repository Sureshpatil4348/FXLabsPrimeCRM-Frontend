import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AdminStats {
  revenue: {
    total: number
    last_month: number
    total_payments: number
    average_payment_amount: number
    currency: string
  }
  users: {
    total_users: number
    total_added: number
    total_active: number
    total_expired: number
    total_users_by_region: Record<string, number>
    recent_users_30_days: number
  }
  partners: {
    total_partners: number
    active_partners: number
    total_commission_paid: number
    last_month_commission: number
  }
  generated_at: string
}

export interface User {
  user_id: string
  email: string | null
  region: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
  has_paid: boolean
  total_spent: number
  converted_at: string | null
  created_at: string | null
  partner: { email: string | null; full_name: string | null } | null
}

export interface UsersResponse {
  users: User[]
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
  filters_applied: {
    status: string | null
    region: string | null
  }
}

export interface Partner {
  partner_id: string
  email: string | null
  full_name: string | null
  region: string | null
  commission_percent: number
  total_earned: number
  total_users: number
  active_users: number
  created_at: string | null
}

export interface PartnersResponse {
  partners: Partner[]
  pagination: {
    current_page: number
    total_pages: number
    total_partners: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

export interface PartnerStats {
  partner: {
    email: string
    full_name: string | null
    commission_percent: number
    is_active: boolean
    joined_at: string
    total_revenue: number
    total_converted: number
  }
  users: {
    total_users: number
    total_pending: number
    total_active: number
    total_expired: number
    users_by_region?: {
      India?: number
      International?: number
    }
    recent_users_30_days: number
    last_month_conversions: number
    conversion_rate: number
  }
  revenue: {
    total: number
    last_month: number
    total_payments: number
    currency: string
  }
  generated_at: string
}

export interface PartnerUsersResponse {
  users: User[]
  partner: {
    partner_id: string
    email: string | null
    full_name: string | null
  }
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

export interface CurrentPartnerReferralsResponse {
  partner_info: {
    email: string
    full_name: string | null
    commission_percent?: number
    total_revenue?: number
    total_converted?: number
    is_active?: boolean
  } | null
  users: Array<{
    email: string
    region: string | null
    subscription_status: string
    subscription_ends_at: string | null
    created_at: string
    converted_at: string | null
    total_payments?: number
  }>
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

interface DashboardStore {
  // Data
  adminStats: AdminStats | null
  allUsers: UsersResponse | null
  allPartners: PartnersResponse | null
  partnerStats: PartnerStats | null
  partnerUsers: PartnerUsersResponse | null
  currentPartnerReferrals: CurrentPartnerReferralsResponse | null

  // Loading states
  loading: {
    adminStats: boolean
    allUsers: boolean
    allPartners: boolean
    partnerStats: boolean
    partnerUsers: boolean
    currentPartnerReferrals: boolean
  }

  // Error states
  errors: {
    adminStats: string | null
    allUsers: string | null
    allPartners: string | null
    partnerStats: string | null
    partnerUsers: string | null
    currentPartnerReferrals: string | null
  }

  // Actions
  preloadAllData: () => Promise<void>
  loadAdminStats: () => Promise<void>
  loadAllUsers: () => Promise<void>
  loadAllPartners: () => Promise<void>
  loadPartnerStats: () => Promise<void>
  loadPartnerUsers: (partnerId: string) => Promise<void>
  loadCurrentPartnerReferrals: () => Promise<void>
  refreshAllData: () => Promise<void>
  clearData: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      adminStats: null,
      allUsers: null,
      allPartners: null,
      partnerStats: null,
      partnerUsers: null,
      currentPartnerReferrals: null,

      loading: {
        adminStats: false,
        allUsers: false,
        allPartners: false,
        partnerStats: false,
        partnerUsers: false,
        currentPartnerReferrals: false,
      },

      errors: {
        adminStats: null,
        allUsers: null,
        allPartners: null,
        partnerStats: null,
        partnerUsers: null,
        currentPartnerReferrals: null,
      },

      // Preload all data when user logs in
      preloadAllData: async () => {
        const promises = [
          get().loadAdminStats(),
          get().loadAllUsers(),
          get().loadAllPartners(),
          get().loadPartnerStats(),
          get().loadCurrentPartnerReferrals(),
        ]

        await Promise.allSettled(promises)
      },

      // Load admin stats
      loadAdminStats: async () => {
        set((state) => ({
          loading: { ...state.loading, adminStats: true },
          errors: { ...state.errors, adminStats: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-admin-stats`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch admin stats')
          }

          const data: AdminStats = await res.json()

          set((state) => ({
            adminStats: data,
            loading: { ...state.loading, adminStats: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, adminStats: false },
            errors: { ...state.errors, adminStats: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Load all users
      loadAllUsers: async () => {
        set((state) => ({
          loading: { ...state.loading, allUsers: true },
          errors: { ...state.errors, allUsers: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-all-users`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch users')
          }

          const data: UsersResponse = await res.json()

          set((state) => ({
            allUsers: data,
            loading: { ...state.loading, allUsers: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, allUsers: false },
            errors: { ...state.errors, allUsers: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Load all partners
      loadAllPartners: async () => {
        set((state) => ({
          loading: { ...state.loading, allPartners: true },
          errors: { ...state.errors, allPartners: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-all-partners`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch partners')
          }

          const data: PartnersResponse = await res.json()

          set((state) => ({
            allPartners: data,
            loading: { ...state.loading, allPartners: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, allPartners: false },
            errors: { ...state.errors, allPartners: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Load partner stats
      loadPartnerStats: async () => {
        set((state) => ({
          loading: { ...state.loading, partnerStats: true },
          errors: { ...state.errors, partnerStats: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-partner-stats`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch partner stats')
          }

          const data: PartnerStats = await res.json()

          set((state) => ({
            partnerStats: data,
            loading: { ...state.loading, partnerStats: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, partnerStats: false },
            errors: { ...state.errors, partnerStats: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Load partner users
      loadPartnerUsers: async (partnerId: string) => {
        set((state) => ({
          loading: { ...state.loading, partnerUsers: true },
          errors: { ...state.errors, partnerUsers: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-partner-users-by-partner?partner_id=${partnerId}`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch partner users')
          }

          const data: PartnerUsersResponse = await res.json()

          set((state) => ({
            partnerUsers: data,
            loading: { ...state.loading, partnerUsers: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, partnerUsers: false },
            errors: { ...state.errors, partnerUsers: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Load current partner referrals
      loadCurrentPartnerReferrals: async () => {
        set((state) => ({
          loading: { ...state.loading, currentPartnerReferrals: true },
          errors: { ...state.errors, currentPartnerReferrals: null },
        }))

        try {
          const res = await fetch(`${API_BASE_URL}/api/get-partner-users-by-partner`, {
            credentials: 'include',
          })

          if (!res.ok) {
            throw new Error('Failed to fetch partner referrals')
          }

          const data: CurrentPartnerReferralsResponse = await res.json()

          set((state) => ({
            currentPartnerReferrals: data,
            loading: { ...state.loading, currentPartnerReferrals: false },
          }))
        } catch (error) {
          set((state) => ({
            loading: { ...state.loading, currentPartnerReferrals: false },
            errors: { ...state.errors, currentPartnerReferrals: error instanceof Error ? error.message : 'Unknown error' },
          }))
        }
      },

      // Refresh all data
      refreshAllData: async () => {
        await get().preloadAllData()
      },

      // Clear all data
      clearData: () => {
        set({
          adminStats: null,
          allUsers: null,
          allPartners: null,
          partnerStats: null,
          partnerUsers: null,
          currentPartnerReferrals: null,
          loading: {
            adminStats: false,
            allUsers: false,
            allPartners: false,
            partnerStats: false,
            partnerUsers: false,
            currentPartnerReferrals: false,
          },
          errors: {
            adminStats: null,
            allUsers: null,
            allPartners: null,
            partnerStats: null,
            partnerUsers: null,
            currentPartnerReferrals: null,
          },
        })
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
)