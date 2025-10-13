import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"

export default function AdminDashboardPage() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Total Users" value={1204} />
        <StatsCard label="MRR" value={"$8,240"} />
        <StatsCard label="Total Referred" value={248} />
        <StatsCard label="Active Trials" value={89} />
        <StatsCard label="Converted" value={42} />
        <StatsCard label="Referrals (7d)" value={36} />
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
