"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PerformanceReportPage() {
  const kpis = [
    { label: "Total Referrals", value: 48 },
    { label: "Signups", value: 19 },
    { label: "Conversions", value: 7 },
    { label: "Conversion Rate", value: "14.6%" },
    { label: "Revenue", value: "$12,450" },
  ]
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">Performance Report</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{k.value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-sm text-muted-foreground">
        Add charts and detailed breakdowns here (e.g., trends by week, source/UTM, funnel).
      </div>
    </main>
  )
}
