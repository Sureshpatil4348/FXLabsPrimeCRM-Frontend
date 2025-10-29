"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { StatsCard } from "@/components/dashboard/stats-card"
import { PartnerStatsPageSkeleton } from "@/components/dashboard/skeleton-stats"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

function PartnerStatsContent() {
  const { partnerStats, loading, errors, loadPartnerStats } = useDashboardStore()

  if (loading.partnerStats) {
    return <PartnerStatsPageSkeleton />
  }

  if (errors.partnerStats) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errors.partnerStats}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => loadPartnerStats()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!partnerStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No partner data available</p>
          <Button onClick={() => loadPartnerStats()}>
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
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Partner Overview</h1>
          <p className="text-sm text-muted-foreground">Your referral performance and earnings dashboard.</p>
        </div>
        <Button
          onClick={() => loadPartnerStats()}
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
        <StatsCard label="Total Users" value={partnerStats.users.total_users} />
        <StatsCard label="Active Users" value={partnerStats.users.total_active} />
        <StatsCard label="Pending Users" value={partnerStats.users.total_pending} />
        <StatsCard label="Expired Users" value={partnerStats.users.total_expired} />
        <StatsCard label="Recent Users (30d)" value={partnerStats.users.recent_users_30_days} />
        <StatsCard label="Conversion Rate" value={`${partnerStats.users.conversion_rate}%`} />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Revenue" value={`$${partnerStats.revenue.total}`} />
        <StatsCard label="Last Month Revenue" value={`$${partnerStats.revenue.last_month}`} />
        <StatsCard label="Total Payments" value={partnerStats.revenue.total_payments} />
        <StatsCard label="Commission Rate" value={`${partnerStats.partner.commission_percent}%`} />
      </div>

      {/* Additional Info */}
      <div className="text-sm text-muted-foreground">
        <p>Last updated: {new Date(partnerStats.generated_at).toLocaleString()}</p>
        <p>Currency: {partnerStats.revenue.currency.toUpperCase()}</p>
      </div>

      {/* Users by Region */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="font-medium mb-2">Users by Region</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Distribution of your referred users across regions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">India:</span> {partnerStats.users.users_by_region?.India || 0} users
          </div>
          <div>
            <span className="font-medium">International:</span> {partnerStats.users.users_by_region?.International || 0} users
          </div>
        </div>
      </div>

      {/* Partner Information */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="font-medium mb-2">Partner Information</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Your partner details and performance metrics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Email:</span> {partnerStats.partner.email}
          </div>
          <div>
            <span className="font-medium">Full Name:</span> {partnerStats.partner.full_name || "Not set"}
          </div>
          <div>
            <span className="font-medium">Commission Rate:</span> {partnerStats.partner.commission_percent}%
          </div>
          <div>
            <span className="font-medium">Status:</span> {partnerStats.partner.is_active ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">Joined:</span> {new Date(partnerStats.partner.joined_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Total Revenue Generated:</span> ${partnerStats.partner.total_revenue}
          </div>
        </div>
      </div>

    </section>
  )
}

export default function PartnerDashboardPage() {
  return <PartnerStatsContent />
}
