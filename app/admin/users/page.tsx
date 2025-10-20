"use client"

import { useEffect, useState } from "react"

type User = {
  user_id: string
  email: string | null
  region: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
  has_stripe_account: boolean
  total_spent: number
  converted_at: string | null
  created_at: string | null
  partner: { email: string | null; full_name: string | null } | null
}

type UsersResponse = {
  users: User[]
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
  filters_applied: {
    status: string | null
    region: string | null
  }
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
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

  const res = await fetch("/api/get-all-users", { headers })
        if (!res.ok) {
          const err = await res.json()
          setError(err.message || "Failed to fetch users")
          return
        }
  const result: UsersResponse = await res.json()
  setData(result)
      } catch (err) {
        setError("Unable to fetch users. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md border rounded-md p-4">
          <h2 className="text-red-600 font-semibold mb-2">Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <section className="grid gap-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">All Users</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage all users across admins, partners, and referrals.
        </p>
      </header>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card">
          <h2 className="font-medium">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-4 py-2 font-medium">Subscription Status</th>
                <th className="px-4 py-2 font-medium">Subscription Ends At</th>
                <th className="px-4 py-2 font-medium">Has Paid</th>
                <th className="px-4 py-2 font-medium">Total Spent</th>
                <th className="px-4 py-2 font-medium">Converted At</th>
                <th className="px-4 py-2 font-medium">Created At</th>
                <th className="px-4 py-2 font-medium">Partner Email</th>
                <th className="px-4 py-2 font-medium">Partner Name</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.user_id} className="border-t border-border">
                  <td className="px-4 py-2">{u.email ?? "-"}</td>
                  <td className="px-4 py-2">{u.region ?? "-"}</td>
                  <td className="px-4 py-2">{u.subscription_status ?? "-"}</td>
                  <td className="px-4 py-2">
                    {u.subscription_ends_at ? new Date(u.subscription_ends_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">{u.has_stripe_account ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">${u.total_spent.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {u.converted_at ? new Date(u.converted_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">{u.partner?.email ?? "-"}</td>
                  <td className="px-4 py-2">{u.partner?.full_name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
