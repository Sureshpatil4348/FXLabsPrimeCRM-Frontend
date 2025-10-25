import { Skeleton } from "@/components/ui/skeleton"

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

export function AdminStatsPageSkeleton() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">High-level performance across partners and referrals.</p>
      </header>
      <StatsGridSkeleton />
      <StatsGridSkeleton />
      <StatsGridSkeleton />
    </section>
  )
}

export function PartnerStatsPageSkeleton() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Your Referral Performance</h1>
        <p className="text-sm text-muted-foreground">Track signups and conversions from your audience.</p>
      </header>
      <StatsGridSkeleton />
      <StatsGridSkeleton />
    </section>
  )
}
