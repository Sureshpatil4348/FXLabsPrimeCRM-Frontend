import { StatsCard } from "@/components/dashboard/stats-card"

export default function partnerDashboardPage() {
  return (
    <section className="grid gap-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-pretty">Your Referral Performance</h1>
        <p className="text-sm text-muted-foreground">Track signups and conversions from your audience.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard label="Total Referred" value={32} />
        <StatsCard label="Signed Up" value={18} />
        <StatsCard label="Converted to Paid" value={7} />
        <StatsCard label="Conversion Rate" value={"21.9%"} />
        <StatsCard label="Revenue" value={"$2,430"} />
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
          or create a{" "}
          .
        </p>
      </div>
    </section>
  )
}
