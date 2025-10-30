"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { UsersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"

function UsersContent() {
  const { allUsers, loading, errors, loadAllUsers } = useDashboardStore()
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    loadAllUsers({ page: currentPage, limit: PAGINATION_LIMIT })
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    // Block pagination while loading to prevent race conditions
    if (loading.allUsers) return
    
    // Clamp page between valid bounds to prevent 400 errors from invalid pages
    if (!allUsers) return
    const { total_pages } = allUsers.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  if (loading.allUsers) {
    return <UsersTableSkeleton />
  }

  if (errors.allUsers) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errors.allUsers}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => loadAllUsers({ page: currentPage, limit: PAGINATION_LIMIT })}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!allUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No user data available</p>
          <Button onClick={() => loadAllUsers({ page: 1, limit: PAGINATION_LIMIT })}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">All Users</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all users across admins, partners, and referrals.
          </p>
        </div>
        <Button
          onClick={() => loadAllUsers({ page: currentPage, limit: PAGINATION_LIMIT })}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </header>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card">
          <h2 className="font-medium">Users ({allUsers.pagination.total_users})</h2>
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
              {allUsers.users.map((u) => (
                <tr key={u.user_id} className="border-t border-border">
                  <td className="px-4 py-2">{u.email ?? "-"}</td>
                  <td className="px-4 py-2">{u.region ?? "-"}</td>
                  <td className="px-4 py-2">{u.subscription_status ?? "-"}</td>
                  <td className="px-4 py-2">
                    {u.subscription_ends_at ? new Date(u.subscription_ends_at).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">{u.has_paid ? "Yes" : "No"}</td>
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

      {/* Pagination */}
      {allUsers && allUsers.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Showing {allUsers.users.length} of {allUsers.pagination.total_users} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={loading.allUsers || !allUsers.pagination.has_previous_page}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm">
              Page {allUsers.pagination.current_page} of {allUsers.pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={loading.allUsers || !allUsers.pagination.has_next_page}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function AdminUsersPage() {
  return <UsersContent />
}
