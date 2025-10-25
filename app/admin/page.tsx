import { Suspense } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AdminStatsPageSkeleton } from "@/components/dashboard/skeleton-stats"

type AdminStats = {
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

async function AdminStatsContent() {
  try {
    const { cookies } = await import("next/headers")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/get-admin-stats`,
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

    const stats: AdminStats = await res.json()

    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard label="Total Users" value={stats.users.total_users} />
          <StatsCard label="Total Revenue" value={`$${stats.revenue.total}`} />
          <StatsCard label="MRR" value={`$${stats.revenue.last_month}`} />
          <StatsCard label="Total Payments" value={stats.revenue.total_payments} />
          <StatsCard label="Avg Payment" value={`$${stats.revenue.average_payment_amount}`} />
          <StatsCard label="Active Users" value={stats.users.total_active} />
          <StatsCard label="Expired Users" value={stats.users.total_expired} />
          <StatsCard label="Recent Users (30d)" value={stats.users.recent_users_30_days} />
          <StatsCard label="Total Partners" value={stats.partners.total_partners} />
          <StatsCard label="Active Partners" value={stats.partners.active_partners} />
          <StatsCard label="Total Commission" value={`$${stats.partners.total_commission_paid}`} />
          <StatsCard label="Last Month Commission" value={`$${stats.partners.last_month_commission}`} />
        </div>

        {/* Additional Info */}
        <div className="text-sm text-muted-foreground">
          <p>Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
          <p>Currency: {stats.revenue.currency.toUpperCase()}</p>
        </div>

        {/* Users by Region */}
        <div className="border border-border rounded-lg p-4">
          <h2 className="font-medium mb-2">Users by Region</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Distribution of users across different regions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(stats.users.total_users_by_region).map(([region, count]) => (
              <div key={region}>
                <span className="font-medium">{region === 'null' ? 'Not Set' : region}:</span> {count} users
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminStatsPageSkeleton />}>
      <AdminStatsContent />
    </Suspense>
  )
}
