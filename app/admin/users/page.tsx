"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { UsersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Edit, RotateCcw, Search, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

type User = any // Replace with proper type from dashboard-store

function UsersContent() {
  const { allUsers, loading, errors, loadAllUsers } = useDashboardStore()
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterBlocked, setFilterBlocked] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editRegion, setEditRegion] = useState("")
  const [editSubscriptionDate, setEditSubscriptionDate] = useState("")
  const [editIsBlocked, setEditIsBlocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuickDays, setSelectedQuickDays] = useState<number | null>(null)

  // Reset password state
  const [resettingPasswordUserId, setResettingPasswordUserId] = useState<string | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  useEffect(() => {
    // Load data with all filters whenever dependencies change
    const loadData = async () => {
      setPaginationLoading(true)
      try {
        const params: any = { page: currentPage, limit: PAGINATION_LIMIT }
        
        if (filterStatus && filterStatus !== "all") params.status = filterStatus
        if (filterBlocked && filterBlocked !== "all") params.blocked = filterBlocked
        if (appliedSearchQuery) {
          params.search = appliedSearchQuery
          params.search_field = searchField
        }
        params.sort_by = sortBy
        params.sort_order = sortOrder
        
        await loadAllUsers(params)
      } finally {
        setPaginationLoading(false)
      }
    }
    loadData()
  }, [currentPage, filterStatus, filterBlocked, appliedSearchQuery, searchField, sortBy, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    // Block pagination while loading to prevent race conditions
    if (paginationLoading) return
    
    // Clamp page between valid bounds to prevent 400 errors from invalid pages
    if (!allUsers) return
    const { total_pages } = allUsers.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setAppliedSearchQuery("")
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    setSearchQuery("")
    setAppliedSearchQuery("")
    setSearchField("all")
    setFilterStatus("all")
    setFilterBlocked("all")
    setSortBy("created_at")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditEmail(user.email || "")
    setEditRegion(user.region || "")
    setEditSubscriptionDate(user.subscription_ends_at || "")
    setEditIsBlocked(Boolean(user.is_blocked))
  }

  const handleCloseEdit = () => {
    setEditingUser(null)
    setEditEmail("")
    setEditRegion("")
    setEditSubscriptionDate("")
    setEditIsBlocked(false)
    setIsSubmitting(false)
    setSelectedQuickDays(null)
  }

  const handleAddSubscriptionDays = (days: number) => {
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + days)
    setEditSubscriptionDate(newDate.toISOString())
    setSelectedQuickDays(days)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/update-user-data", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: editingUser.user_id,
          email: editEmail !== editingUser.email ? editEmail : undefined,
          region: editRegion !== editingUser.region ? editRegion : undefined,
          subscription_ends_at: editSubscriptionDate !== editingUser.subscription_ends_at ? editSubscriptionDate : undefined
            ,
            is_blocked: editIsBlocked !== Boolean(editingUser.is_blocked) ? editIsBlocked : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default"
      })

      handleCloseEdit()
      // Reload the current page data with filters
      const params: any = { page: currentPage, limit: PAGINATION_LIMIT }
      if (filterStatus && filterStatus !== "all") params.status = filterStatus
      if (filterBlocked && filterBlocked !== "all") params.blocked = filterBlocked
      if (appliedSearchQuery) {
        params.search = appliedSearchQuery
        params.search_field = searchField
      }
      params.sort_by = sortBy
      params.sort_order = sortOrder
      await loadAllUsers(params)
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (user: any) => {
    setResettingPasswordUserId(user.email)
  }

  const handleConfirmResetPassword = async () => {
    if (!resettingPasswordUserId) return

    setIsResettingPassword(true)
    try {
      const response = await fetch("/api/reset-user-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: resettingPasswordUserId
        })
      })

      const data = await response.json()

      if (!response.ok && response.status !== 207) {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password",
          variant: "destructive"
        })
        return
      }

      // 207 means password reset but email failed
      if (response.status === 207) {
        toast({
          title: "Warning",
          description: data.message || "Password reset but email could not be sent",
          variant: "default"
        })
      } else {
        toast({
          title: "Success",
          description: "Password reset successfully. Email sent to user.",
          variant: "default"
        })
      }

      setResettingPasswordUserId(null)
      // Reload the current page data with filters
      const params: any = { page: currentPage, limit: PAGINATION_LIMIT }
      if (filterStatus && filterStatus !== "all") params.status = filterStatus
      if (filterBlocked && filterBlocked !== "all") params.blocked = filterBlocked
      if (appliedSearchQuery) {
        params.search = appliedSearchQuery
        params.search_field = searchField
      }
      params.sort_by = sortBy
      params.sort_order = sortOrder
      await loadAllUsers(params)
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleCancelResetPassword = () => {
    setResettingPasswordUserId(null)
  }

  // Users are now filtered and sorted server-side
  const filteredUsers = allUsers?.users ?? []

  // Only show skeleton on initial load, not on pagination
  if (loading.allUsers && !allUsers) {
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
            onClick={() => {
              const params: any = { page: currentPage, limit: PAGINATION_LIMIT }
              if (filterStatus && filterStatus !== "all") params.status = filterStatus
              if (filterBlocked && filterBlocked !== "all") params.blocked = filterBlocked
              if (appliedSearchQuery) {
                params.search = appliedSearchQuery
                params.search_field = searchField
              }
              params.sort_by = sortBy
              params.sort_order = sortOrder
              loadAllUsers(params)
            }}
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
          <Button onClick={() => loadAllUsers({ page: 1, limit: PAGINATION_LIMIT, sort_by: "created_at", sort_order: "desc" })}>
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
          onClick={() => {
            const params: any = { page: currentPage, limit: PAGINATION_LIMIT }
            if (filterStatus && filterStatus !== "all") params.status = filterStatus
            if (filterBlocked && filterBlocked !== "all") params.blocked = filterBlocked
            if (appliedSearchQuery) {
              params.search = appliedSearchQuery
              params.search_field = searchField
            }
            params.sort_by = sortBy
            params.sort_order = sortOrder
            loadAllUsers(params)
          }}
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
          <h2 className="font-medium mb-4">Users ({allUsers.pagination.total_users})</h2>
          
          {/* Search and Filter Bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex gap-2 items-center flex-1 min-w-96">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm whitespace-nowrap"
              >
                <option value="all">All Fields</option>
                <option value="email">Email</option>
                <option value="region">Region</option>
                <option value="partner_email">Partner Email</option>
                <option value="partner_name">Partner Name</option>
              </select>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSearch}
                    className="h-8 w-8 p-0"
                    title="Search"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  {searchQuery && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                      className="h-8 w-8 p-0"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="trial">Free</option>
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={filterBlocked}
              onChange={(e) => setFilterBlocked(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Users</option>
              <option value="blocked">Blocked</option>
              <option value="unblocked">Unblocked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="created_at">Sort by Created At</option>
              <option value="subscription_ends_at">Sort by Subscription Ends At</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            {(appliedSearchQuery || searchField !== "all" || filterStatus !== "all" || filterBlocked !== "all" || sortBy !== "created_at" || sortOrder !== "desc") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Actions</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Region</th>
                <th className="px-4 py-2 font-medium">Subscription Status</th>
                <th className="px-4 py-2 font-medium">Subscription Ends At</th>
                <th className="px-4 py-2 font-medium">Total Spent</th>
                <th className="px-4 py-2 font-medium">Is Blocked</th>
                <th className="px-4 py-2 font-medium">Partner Email</th>
                <th className="px-4 py-2 font-medium">Partner Name</th>
                <th className="px-4 py-2 font-medium">Converted At</th>
                <th className="px-4 py-2 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.user_id} className="border-t border-border">
                    <td className="px-4 py-2 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 flex items-center gap-1"
                        onClick={() => handleEditClick(u)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 flex items-center gap-1"
                        onClick={() => handleResetPassword(u)}
                        disabled={isResettingPassword}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Password
                      </Button>
                    </td>
                    <td className="px-4 py-2">{u.email ?? "-"}</td>
                    <td className="px-4 py-2">{u.region ?? "-"}</td>
                    <td className="px-4 py-2">{u.subscription_status === "trial" ? "free" : u.subscription_status ?? "-"}</td>
                    <td className="px-4 py-2">
                      {u.subscription_ends_at ? new Date(u.subscription_ends_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">${u.total_spent.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{u.partner?.email ?? "-"}</td>
                    <td className="px-4 py-2">{u.partner?.full_name ?? "-"}</td>
                    <td className="px-4 py-2">
                      {u.converted_at ? new Date(u.converted_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                    No users found matching your search or filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {allUsers && allUsers.pagination.total_pages > 1 && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {allUsers.pagination.total_users} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={paginationLoading || !allUsers.pagination.has_previous_page}
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
              disabled={paginationLoading || !allUsers.pagination.has_next_page}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={handleCloseEdit}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white border border-border rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                onClick={handleCloseEdit}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                <select
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                >
                  <option value="">Select Region</option>
                  <option value="India">India</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subscription Ends At</label>
                <Input
                  type="datetime-local"
                  value={editSubscriptionDate ? new Date(editSubscriptionDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditSubscriptionDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quick Add Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 90].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant={selectedQuickDays === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAddSubscriptionDays(days)}
                      className="h-9 text-xs font-medium"
                    >
                      +{days}d
                    </Button>
                  ))}
                </div>
              </div>

              {editSubscriptionDate && (
                <div className="p-3 bg-muted border border-border rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">New expiry:</span>{" "}
                    {new Date(editSubscriptionDate).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">Is Blocked</span>
                  <Switch checked={editIsBlocked} onCheckedChange={(val) => setEditIsBlocked(Boolean(val))} />
                </label>
                <p className="text-sm text-muted-foreground mt-1">Toggle to block or unblock this user.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={handleCloseEdit}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Dialog */}
      {resettingPasswordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={handleCancelResetPassword}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-white border border-border rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button
                onClick={handleCancelResetPassword}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">⚠️ Warning:</span> This will generate a new temporary password and send it to the user via email. The user will need to log in with the new password.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to reset the password for this user? They will receive an email with their new temporary password.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={handleCancelResetPassword}
                disabled={isResettingPassword}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmResetPassword}
                disabled={isResettingPassword}
                className="flex-1"
              >
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function AdminUsersPage() {
  return <UsersContent />
}
