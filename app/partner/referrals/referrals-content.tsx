"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type PartnerUser = {
  email: string
  region: string | null
  subscription_status: string
  subscription_ends_at: string | null
  created_at: string
  converted_at: string | null
}

type PartnerUsersResponse = {
  partner_info: {
    email: string
    full_name: string | null
  }
  users: PartnerUser[]
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

export default function ReferralsContentClient({ data }: { data: PartnerUsersResponse }) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | "invited" | "active" | "inactive" | "converted">("all")

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()

    return data.users.filter((user) => {
      const matchesSearch = !t || user.email.toLowerCase().includes(t)
      const matchesStatus = status === "all" || user.subscription_status === status
      return matchesSearch && matchesStatus
    })
  }, [q, status])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "invited":
        return "secondary"
      case "active":
        return "default"
      case "converted":
        return "default"
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pretty">My Referrals</h1>
        <div className="flex gap-2">
          <Link href="/partner/add" className="underline text-sm">
            Add Referrals
          </Link>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        <p>Partner: {data.partner_info.full_name || data.partner_info.email}</p>
        <p>Total Users: {data.pagination.total_users}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Referrals</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search emails..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={status} onValueChange={(v: "all" | "invited" | "active" | "inactive" | "converted") => setStatus(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Region</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Subscription Ends</th>
                  <th className="py-2 pr-4">Created At</th>
                  <th className="py-2 pr-4">Converted At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((user) => (
                    <tr key={user.email} className="border-b last:border-0">
                      <td className="py-2 pr-4 break-words min-w-0">{user.email}</td>
                      <td className="py-2 pr-4">{user.region || "—"}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                          {user.subscription_status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {user.subscription_ends_at ? new Date(user.subscription_ends_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2 pr-4">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">
                        {user.converted_at ? new Date(user.converted_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 pr-4 text-muted-foreground" colSpan={6}>
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

          {data.pagination.total_pages > 1 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Page {data.pagination.current_page} of {data.pagination.total_pages} • {data.pagination.total_users} total users
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
