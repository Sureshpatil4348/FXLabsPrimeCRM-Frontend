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
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Your Referral Performance</h1>
        <p className="text-sm text-muted-foreground">Track signups and conversions from your audience.</p>
        <div className="text-sm text-muted-foreground mt-2">
          <p>Welcome back!</p>
          <p>Last updated: {new Date(partnerStats.generated_at).toLocaleString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatsCard label="Total Users" value={partnerStats.users.total_users} />
        <StatsCard label="Active" value={partnerStats.users.total_active} />
        <StatsCard label="Expired" value={partnerStats.users.total_expired} />
        <StatsCard label="Recent Users (30d)" value={partnerStats.users.recent_users_30_days} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Revenue Generated" value={`$${partnerStats.revenue.total}`} />
        <StatsCard label="Last Month Revenue" value={`$${partnerStats.revenue.last_month}`} />
        <StatsCard label="Total Payments" value={partnerStats.revenue.total_payments} />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="font-medium mb-2">Partner Information</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Your partner details and performance metrics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Currency:</span> {partnerStats.revenue.currency.toUpperCase()}
          </div>
          <div>
            <span className="font-medium">Total Revenue:</span> ${partnerStats.revenue.total}
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="font-medium mb-1">Next steps</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your referrals on the{" "}
          <a className="underline" href="/partner/referrals">
            My Referrals
          </a>{" "}
          page. Add new prospects via{" "}
          <a className="underline" href="/partner/add">
            Add Referrals
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default function PartnerDashboardPage() {
  return <PartnerStatsContent />
}
