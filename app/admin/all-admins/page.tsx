"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function AdminsContent() {
  const { allAdmins, loading, errors, loadAllAdmins } = useDashboardStore()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Always load data with pagination on mount or when page changes
    const loadData = async () => {
      setPaginationLoading(true)
      try {
        await loadAllAdmins({ page: currentPage, limit: PAGINATION_LIMIT })
      } finally {
        setPaginationLoading(false)
      }
    }
    loadData()
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    // Block pagination while loading to prevent race conditions
    if (paginationLoading) return
    
    // Clamp page between valid bounds to prevent 400 errors from invalid pages
    if (!allAdmins) return
    const { total_pages } = allAdmins.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  // Only show skeleton on initial load, not on pagination
  if (loading.allAdmins && !allAdmins) {
    return <PartnersTableSkeleton />
  }

  if (errors.allAdmins) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errors.allAdmins}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => {
              setCurrentPage(1)
              loadAllAdmins({ page: 1, limit: PAGINATION_LIMIT })
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!allAdmins) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No admin data available</p>
          <Button onClick={() => loadAllAdmins({ page: 1, limit: PAGINATION_LIMIT })}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Admins
          </Button>
        </div>
      </div>
    )
  }

  const copyAdminEmail = async (adminEmail: string) => {
    try {
      await navigator.clipboard.writeText(adminEmail)
      setCopiedEmail(adminEmail)
      toast({
        title: "Admin email copied",
        description: "Admin email has been copied to clipboard",
      })
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy admin email to clipboard",
        variant: "destructive",
      })
    }
  }

  // Calculate statistics from the admins data
  const totalAdmins = allAdmins.pagination.total

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Admins</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all admins in the system.
          </p>
        </div>
        <Button
          onClick={() => {
            setCurrentPage(1)
            loadAllAdmins({ page: 1, limit: PAGINATION_LIMIT })
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </header>

      

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
          <CardDescription>A list of all admins in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAdmins.admins.map((admin) => (
                <TableRow key={admin.email}>
                  <TableCell className="font-medium">{admin.full_name || "-"}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => admin.email && copyAdminEmail(admin.email)}
                      disabled={!admin.email}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {copiedEmail === admin.email ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedEmail === admin.email ? "Copied!" : "Copy Email"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {allAdmins && allAdmins.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
              <div className="text-sm text-muted-foreground">
                Showing {allAdmins.admins.length} of {allAdmins.pagination.total} admins
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={paginationLoading || !allAdmins.pagination.has_prev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {allAdmins.pagination.page} of {allAdmins.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={paginationLoading || !allAdmins.pagination.has_next}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminAllAdminsPage() {
  return <AdminsContent />
}