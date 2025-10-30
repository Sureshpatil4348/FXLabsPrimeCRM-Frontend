"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

export default function ReferralsContentClient() {
  const { currentPartnerReferrals, loading, errors, loadCurrentPartnerReferrals } = useDashboardStore()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | "trial" | "paid" | "expired">("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadCurrentPartnerReferrals({ page: currentPage, limit: PAGINATION_LIMIT })
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    // Clamp page between valid bounds to prevent 400 errors from invalid pages
    if (!currentPartnerReferrals) return
    const { total_pages } = currentPartnerReferrals.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  const filtered = useMemo(() => {
    if (!currentPartnerReferrals) return []
    const t = q.trim().toLowerCase()

    return currentPartnerReferrals.users.filter((user) => {
      const matchesSearch = !t || user.email.toLowerCase().includes(t)
      const matchesStatus = status === "all" || user.subscription_status === status
      return matchesSearch && matchesStatus
    })
  }, [q, status, currentPartnerReferrals])

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

  if (loading.currentPartnerReferrals) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-pretty">My Referrals</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  if (errors.currentPartnerReferrals) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-semibold text-pretty">My Referrals</div>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.currentPartnerReferrals}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => {
                setCurrentPage(1)
                loadCurrentPartnerReferrals({ page: 1, limit: PAGINATION_LIMIT })
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  if (!currentPartnerReferrals) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-semibold text-pretty">My Referrals</div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No referral data available</p>
            <Button onClick={() => loadCurrentPartnerReferrals({ page: 1, limit: PAGINATION_LIMIT })}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Referrals
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">My Referrals</h1>
          <p className="text-sm text-muted-foreground">View and manage your referred users</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setCurrentPage(1)
              loadCurrentPartnerReferrals({ page: 1, limit: PAGINATION_LIMIT })
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        <p>Partner: {currentPartnerReferrals.partner_info ? (currentPartnerReferrals.partner_info.full_name || currentPartnerReferrals.partner_info.email) : "Viewing as Admin"}</p>
        <p>Total Users: {currentPartnerReferrals.pagination.total_users}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Referrals</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search emails..." value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <Select value={status} onValueChange={(v: "all" | "trial" | "paid" | "expired") => setStatus(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
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

          {/* Pagination */}
          {/* Pagination */}
          {currentPartnerReferrals && currentPartnerReferrals.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filtered.length} of {currentPartnerReferrals.pagination.total_users} referrals
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!currentPartnerReferrals.pagination.has_previous_page}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPartnerReferrals.pagination.current_page} of {currentPartnerReferrals.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!currentPartnerReferrals.pagination.has_next_page}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
