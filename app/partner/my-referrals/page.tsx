"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Ref = { email: string; addedAt?: string; status?: "pending" | "joined" | "converted" }

export default function MyReferralsPage() {
  const [rows, setRows] = useState<Ref[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("partner:emails")
    const data = raw ? (JSON.parse(raw) as string[]) : []
    const normalized: Ref[] = data.map((email) => ({
      email,
      addedAt: new Date().toISOString().slice(0, 10),
      status: "pending",
    }))
    setRows(normalized)
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter((r) => r.email.toLowerCase().includes(t))
  }, [rows, q])

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
          <div className="flex items-center gap-2">
            <Input placeholder="Search emails..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
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
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((r) => (
                    <tr key={r.email} className="border-b last:border-0">
                      <td className="py-2 pr-4">{r.email}</td>
                      <td className="py-2 pr-4">{r.addedAt || "—"}</td>
                      <td className="py-2 pr-4 capitalize">{r.status || "pending"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 pr-4 text-muted-foreground" colSpan={3}>
                      No referrals yet. Add some on the{" "}
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
