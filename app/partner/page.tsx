import { Suspense } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { PartnerStatsPageSkeleton } from "@/components/dashboard/skeleton-stats"

type PartnerStats = {
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
    users_by_region: Record<string, number>
    recent_signups_30_days: number
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

async function PartnerStatsContent() {
  try {
    const { cookies } = await import("next/headers")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/get-partner-stats`,
      {
        headers: {
          Cookie: (await cookies()).toString(),
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch stats")
    }

    const stats: PartnerStats = await res.json()

    // Use conversion rate from API
    const conversionRate = stats.users.conversion_rate

    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Your Referral Performance</h1>
          <p className="text-sm text-muted-foreground">Track signups and conversions from your audience.</p>
          <div className="text-sm text-muted-foreground mt-2">
            <p>Welcome back, {stats.partner.full_name || stats.partner.email}!</p>
            <p>Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatsCard label="Total Users" value={stats.users.total_users} />
          <StatsCard label="Pending" value={stats.users.total_pending} />
          <StatsCard label="Active" value={stats.users.total_active} />
          <StatsCard label="Expired" value={stats.users.total_expired} />
          <StatsCard label="Conversion Rate" value={`${conversionRate}%`} />
          <StatsCard label="Recent Users (30d)" value={stats.users.recent_signups_30_days} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Revenue Generated" value={`$${stats.revenue.total}`} />
          <StatsCard label="Last Month Revenue" value={`$${stats.revenue.last_month}`} />
          <StatsCard label="Total Payments" value={stats.revenue.total_payments} />
          <StatsCard label="Last Month Conversions" value={stats.users.last_month_conversions} />
        </div>

        <div className="border border-border rounded-lg p-4">
          <h2 className="font-medium mb-2">Partner Information</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Your partner details and performance metrics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span> {stats.partner.email}
            </div>
            <div>
              <span className="font-medium">Name:</span> {stats.partner.full_name || 'Not set'}
            </div>
            <div>
              <span className="font-medium">Commission Rate:</span> {stats.partner.commission_percent}%
            </div>
            <div>
              <span className="font-medium">Status:</span> {stats.partner.is_active ? 'Active' : 'Inactive'}
            </div>
            <div>
              <span className="font-medium">Total Revenue:</span> ${stats.partner.total_revenue}
            </div>
            <div>
              <span className="font-medium">Total Conversions:</span> {stats.partner.total_converted}
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
            </a>{" "}
            or create a
            .
          </p>
        </div>
      </section>
    )
  } catch (error) {
    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Your Referral Performance</h1>
          <p className="text-sm text-muted-foreground">Track signups and conversions from your audience.</p>
        </header>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-full max-w-md border rounded-md p-4">
            <h2 className="text-red-600 font-semibold mb-2">Error</h2>
            <p className="text-sm">Unable to load stats. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }
}

export default function partnerDashboardPage() {
  return (
    <Suspense fallback={<PartnerStatsPageSkeleton />}>
      <PartnerStatsContent />
    </Suspense>
  )
}
