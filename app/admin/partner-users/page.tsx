"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PAGINATION_LIMIT } from "@/lib/pagination"

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
  } | null
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
  const [partnerEmail, setPartnerEmail] = useState("")
  const [data, setData] = useState<PartnerUsersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerEmail.trim()) {
      setError("Please enter a partner email")
      return
    }

    setLoading(true)
    setError("")
    setData(null)
    setCurrentPage(1)

    try {
      const response = await fetch(`/api/get-partner-users-by-partner?page=1&limit=${PAGINATION_LIMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partner_email: partnerEmail.trim() })
      })

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

  const handlePageChange = async (page: number) => {
    if (!partnerEmail.trim() || !data) return

    setPaginationLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/get-partner-users-by-partner?page=${page}&limit=${PAGINATION_LIMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partner_email: partnerEmail.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch partner users")
      }

      const result: PartnerUsersResponse = await response.json()
      setData(result)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setPaginationLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "trial":
        return "secondary"
      case "paid":
        return "default"
      case "expired":
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
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="Enter Partner Email"
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
            <p>Partner: {data.partner_info ? (data.partner_info.full_name || data.partner_info.email) : "Viewing as Admin"}</p>
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
                          <td className="py-2 pr-4 break-all min-w-0">{user.email}</td>
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
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {data.users.length} of {data.pagination.total_users} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!data.pagination.has_previous_page || paginationLoading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {data.pagination.current_page} of {data.pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!data.pagination.has_next_page || paginationLoading}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && !error && partnerEmail && (
        <div className="text-center py-8 text-gray-500">
          Enter a partner email and click &apos;Get Users&apos; to view partner users.
        </div>
      )}
    </main>
  )
}
