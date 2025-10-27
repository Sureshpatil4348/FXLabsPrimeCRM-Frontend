"use client"

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useDashboardStore } from '@/lib/dashboard-store'
import { getSession } from '@/lib/auth'

interface DashboardProviderProps {
  children: ReactNode
}

const DashboardContext = createContext<{
  isDataLoaded: boolean
  refreshData: () => Promise<void>
}>({
  isDataLoaded: false,
  refreshData: async () => {},
})

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { preloadAllData, refreshAllData, adminStats, allUsers, allPartners, partnerStats } = useDashboardStore()

  // Check if all critical data is loaded
  const isDataLoaded = !!(adminStats || allUsers || allPartners || partnerStats)

  useEffect(() => {
    const session = getSession()

    // Only preload data if user is logged in
    if (session?.email) {
      console.log('[DashboardProvider] Preloading dashboard data...')
      preloadAllData().then(() => {
        console.log('[DashboardProvider] Dashboard data preloaded successfully')
      }).catch((error) => {
        console.error('[DashboardProvider] Failed to preload dashboard data:', error)
      })
    }
  }, [preloadAllData])

  const refreshData = async () => {
    console.log('[DashboardProvider] Refreshing dashboard data...')
    await refreshAllData()
    console.log('[DashboardProvider] Dashboard data refreshed')
  }

  return (
    <DashboardContext.Provider value={{ isDataLoaded, refreshData }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}