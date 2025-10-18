"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"

type AdminStats = {
  revenue: {
    total: number
    last_month: number
    currency: string
  }
  users: {
    total_invited: number
    total_converted: number
    on_trial: number
    active_subscriptions: number
    invited_not_converted: number
    churned: number
    recent_signups_30_days: number
  }
  partners: {
    total_partners: number
    active_partners: number
    total_commission_paid: number
    last_month_commission: number
  }
  generated_at: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        let headers: HeadersInit | undefined
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("tr-auth-tokens")
            if (raw) {
              const tokens = JSON.parse(raw) as { authorization?: string; adminToken?: string }
              headers = {
                ...(tokens.authorization ? { Authorization: tokens.authorization } : {}),
                ...(tokens.adminToken ? { "Admin-Token": tokens.adminToken } : {}),
              }
            }
          } catch {}
        }

        const res = await fetch("/api/get-admin-stats", { headers })
        if (!res.ok) {
          const err = await res.json()
          setError(err.message || "Failed to fetch stats")
          return
        }
        const result: AdminStats = await res.json()
        setStats(result)
      } catch (err) {
        setError("Unable to fetch stats. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
        </header>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading stats...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="grid gap-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
        </header>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-full max-w-md border rounded-md p-4">
            <h2 className="text-red-600 font-semibold mb-2">Error</h2>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!stats) return null

  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Total Users" value={stats.users.total_invited} />
        <StatsCard label="Total Revenue" value={`$${stats.revenue.total}`} />
        <StatsCard label="MRR" value={`$${stats.revenue.last_month}`} />
        <StatsCard label="Converted" value={stats.users.total_converted} />
        <StatsCard label="Active Trials" value={stats.users.on_trial} />
        <StatsCard label="Active Subscriptions" value={stats.users.active_subscriptions} />
        <StatsCard label="Churned" value={stats.users.churned} />
        <StatsCard label="Recent Signups (30d)" value={stats.users.recent_signups_30_days} />
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



      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/partners">Manage Partners</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/users">All Users</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/referrals">All Referrals</Link>
        </Button>
      </div>
    </section>
  )
}
