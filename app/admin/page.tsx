"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AdminStatsPageSkeleton } from "@/components/dashboard/skeleton-stats"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

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
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Total Users" value={adminStats.users.total_users} />
        <StatsCard label="Total Revenue" value={`$${adminStats.revenue.total}`} />
        <StatsCard label="MRR" value={`$${adminStats.revenue.last_month}`} />
        <StatsCard label="Total Payments" value={adminStats.revenue.total_payments} />
        <StatsCard label="Avg Payment" value={`$${adminStats.revenue.average_payment_amount}`} />
        <StatsCard label="Active Users" value={adminStats.users.total_active} />
        <StatsCard label="Expired Users" value={adminStats.users.total_expired} />
        <StatsCard label="Recent Users (30d)" value={adminStats.users.recent_users_30_days} />
        <StatsCard label="Total Partners" value={adminStats.partners.total_partners} />
        <StatsCard label="Active Partners" value={adminStats.partners.active_partners} />
        <StatsCard label="Total Commission" value={`$${adminStats.partners.total_commission_paid}`} />
        <StatsCard label="Last Month Commission" value={`$${adminStats.partners.last_month_commission}`} />
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
          {Object.entries(adminStats.users.total_users_by_region).map(([region, count]) => (
            <div key={region}>
              <span className="font-medium">{region === 'null' ? 'Not Set' : region}:</span> {count} users
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
