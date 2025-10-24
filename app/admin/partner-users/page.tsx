"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface PartnerUser {
  email: string
  region: string | null
  subscription_status: string
  subscription_ends_at: string | null
  created_at: string
  converted_at: string | null
}

interface PartnerUsersResponse {
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

export default function PartnerUsersPage() {
  const [partnerId, setPartnerId] = useState("")
  const [data, setData] = useState<PartnerUsersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId.trim()) {
      setError("Please enter a partner ID")
      return
    }

    setLoading(true)
    setError("")
    setData(null)

    try {
      const response = await fetch(`/api/get-partner-users-by-partner?partner_id=${encodeURIComponent(partnerId)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch partner users")
      }

      const result: PartnerUsersResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-semibold text-pretty">Partner Users</h1>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            placeholder="Enter Partner ID"
            className="flex-1"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Users"}
          </button>
        </div>
      </form>

      {error && (
        <Card className="w-full max-w-md mx-auto mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            <p>Partner: {data.partner_info.full_name || data.partner_info.email}</p>
            <p>Total Users: {data.pagination.total_users}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
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
                    {data.users.length ? (
                      data.users.map((user) => (
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
                          No users found for this partner.
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
        </>
      )}

      {!data && !loading && !error && partnerId && (
        <div className="text-center py-8 text-gray-500">
          Enter a partner ID and click &quot;Get Users&quot; to view partner users.
        </div>
      )}
    </main>
  )
}
