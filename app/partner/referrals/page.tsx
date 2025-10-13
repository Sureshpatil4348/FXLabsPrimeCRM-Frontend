"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type Ref = { email: string; addedAt?: string; status?: "pending" | "joined" | "converted"; revenue?: number }

export default function MyReferralsPage() {
  const [rows, setRows] = useState<Ref[]>([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | "pending" | "joined" | "converted">("all")
  const [minRevenue, setMinRevenue] = useState<string>("")

  useEffect(() => {
    const raw = localStorage.getItem("partner:emails")
    const data = raw ? (JSON.parse(raw) as string[]) : []
    const normalized: Ref[] = data.map((email) => ({
      email,
      addedAt: new Date().toISOString().slice(0, 10),
      status: "pending",
      revenue: 0,
    }))
    setRows(normalized)
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    const min = Number.isNaN(Number(minRevenue)) || minRevenue === "" ? 0 : Number(minRevenue)

    return rows.filter((r) => {
      const matchesSearch = !t || r.email.toLowerCase().includes(t)
      const matchesStatus = status === "all" || (r.status || "pending") === status
      const rev = typeof r.revenue === "number" ? r.revenue : 0
      const matchesMinRevenue = rev >= min
      return matchesSearch && matchesStatus && matchesMinRevenue
    })
  }, [rows, q, status, minRevenue])

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pretty">My Referrals</h1>
        <div className="flex gap-2">
          <Link href="/partner/add" className="underline text-sm">
            Add Referrals
          </Link>
          <Link href="/partner/magic-link" className="underline text-sm">
            Magic Link
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Referrals</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search emails..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={status} onValueChange={(v: "all" | "pending" | "joined" | "converted") => setStatus(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder="Min revenue"
              value={minRevenue}
              onChange={(e) => setMinRevenue(e.target.value)}
              className="w-36"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Added</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((r) => (
                    <tr key={r.email} className="border-b last:border-0">
                      <td className="py-2 pr-4 break-words min-w-0">{r.email}</td>
                      <td className="py-2 pr-4">{r.addedAt || "—"}</td>
                      <td className="py-2 pr-4 capitalize">{r.status || "pending"}</td>
                      <td className="py-2 pr-4">
                        {`$${(typeof r.revenue === "number" ? r.revenue : 0).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 pr-4 text-muted-foreground" colSpan={4}>
                      No referrals match your filters. Add some on the{" "}
                      <Link className="underline" href="/partner/add">
                        Add Referrals
                      </Link>{" "}
                      page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
