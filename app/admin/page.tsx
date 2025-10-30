"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AdminStatsPageSkeleton } from "@/components/dashboard/skeleton-stats"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function StatsCardWithInfo({ label, value, info }: { label: string; value: string | number; info: string }) {
  return (
    <div className="relative">
      <StatsCard label={label} value={value} />
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-200 transition-colors">
            <Info className="w-4 h-4 text-gray-600" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800/90 text-white border border-gray-600 max-w-sm">
          <p>{info}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function AdminStatsContent() {
  const { adminStats, loading, errors, loadAdminStats } = useDashboardStore()

  if (loading.adminStats) {
    return <AdminStatsPageSkeleton />
  }

  if (errors.adminStats) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errors.adminStats}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => loadAdminStats()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!adminStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No data available</p>
          <Button onClick={() => loadAdminStats()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="grid gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
        </div>
        <Button
          onClick={() => loadAdminStats()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* User Cards */}
        <StatsCardWithInfo 
          label="Total Users" 
          value={adminStats.users.total_users} 
          info="Total number of users registered across the entire platform."
        />
        <StatsCardWithInfo 
          label="Active Users" 
          value={adminStats.users.total_active} 
          info="All active users of the platform, who are not expired yet."
        />
        <StatsCardWithInfo 
          label="Expired Users" 
          value={adminStats.users.total_expired} 
          info="Users whose subscriptions have expired."
        />
        <StatsCardWithInfo 
          label="Trial Users" 
          value={adminStats.users.total_trial} 
          info="Users currently in their trial period."
        />
        <StatsCardWithInfo 
          label="Paid Users" 
          value={adminStats.users.total_paid} 
          info="Users with active paid subscriptions."
        />
        <StatsCardWithInfo 
          label="Recent Users (30d)" 
          value={adminStats.users.recent_users_30_days} 
          info="Number of new users who registered in the last 30 days."
        />
        
        {/* Revenue & Commission Cards */}
        <StatsCardWithInfo 
          label="Total Revenue" 
          value={`$${adminStats.revenue.total}`} 
          info="Total revenue generated from all paid subscriptions till date."
        />
        <StatsCardWithInfo 
          label="Revenue (30d)" 
          value={`$${adminStats.revenue.last_month}`} 
          info="Total revenue generated in the last 30 days."
        />
        <StatsCardWithInfo 
          label="Total Commission" 
          value={`$${adminStats.partners.total_commission_paid}`} 
          info="Total commission paid to all partners since the program began."
        />
        <StatsCardWithInfo 
          label="Commission (30d)" 
          value={`$${adminStats.partners.last_month_commission}`} 
          info="Total commission paid to partners in the last 30 days."
        />
        
        {/* Partner Cards */}
        <StatsCardWithInfo 
          label="Total Partners" 
          value={adminStats.partners.total_partners} 
          info="Total number of registered partners."
        />
        <StatsCardWithInfo 
          label="Active Partners" 
          value={adminStats.partners.active_partners} 
          info="Partners who are currently active and earning commissions."
        />
      </div>

      {/* Additional Info */}
      <div className="text-sm text-muted-foreground">
        <p>Last updated: {new Date(adminStats.generated_at).toLocaleString()}</p>
        <p>Currency: {adminStats.revenue.currency.toUpperCase()}</p>
      </div>

      {/* Users by Region */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="font-medium mb-2">Users by Region</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Distribution of users across different regions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {Object.entries(adminStats.users.total_users_by_region)
            .filter(([region]) => region !== 'null')
            .map(([region, count]) => (
            <div key={region}>
              <span className="font-medium">{region}:</span> {count} users
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AdminDashboardPage() {
  return <AdminStatsContent />
}
