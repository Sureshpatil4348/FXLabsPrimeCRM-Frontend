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

function PartnersContent() {
  const { allPartners, loading, errors, loadAllPartners } = useDashboardStore()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    loadAllPartners({ page: currentPage, limit: PAGINATION_LIMIT })
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page: number) => {
    // Block pagination while loading to prevent race conditions
    if (loading.allPartners) return
    
    // Clamp page between valid bounds to prevent 400 errors from invalid pages
    if (!allPartners) return
    const { total_pages } = allPartners.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  if (loading.allPartners) {
    return <PartnersTableSkeleton />
  }

  if (errors.allPartners) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {errors.allPartners}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => loadAllPartners({ page: currentPage, limit: PAGINATION_LIMIT })}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!allPartners) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No partner data available</p>
          <Button onClick={() => loadAllPartners({ page: 1, limit: PAGINATION_LIMIT })}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Partners
          </Button>
        </div>
      </div>
    )
  }

  const copyPartnerEmail = async (partnerEmail: string) => {
    try {
      await navigator.clipboard.writeText(partnerEmail)
      setCopiedEmail(partnerEmail)
      toast({
        title: "Partner email copied",
        description: "Partner email has been copied to clipboard",
      })
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy partner email to clipboard",
        variant: "destructive",
      })
    }
  }

  const currency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

  // Calculate statistics from the partners data
  const totalPartners = allPartners.pagination.total
  const totalRevenue = allPartners.partners.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
  const totalAdded = allPartners.partners.reduce((sum, p) => sum + (p.total_added || 0), 0)
  const totalConverted = allPartners.partners.reduce((sum, p) => sum + (p.total_converted || 0), 0)

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Partners</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all partners in the system.
          </p>
        </div>
        <Button
          onClick={() => loadAllPartners({ page: currentPage, limit: PAGINATION_LIMIT })}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConverted}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>A list of all partners in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Total Added</TableHead>
                <TableHead>Total Converted</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPartners.partners.map((partner) => (
                <TableRow key={partner.partner_id}>
                  <TableCell className="font-medium">{partner.full_name || "-"}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.commission_percent}%</TableCell>
                  <TableCell>{currency(partner.total_revenue || 0)}</TableCell>
                  <TableCell>{partner.total_added || 0}</TableCell>
                  <TableCell>{partner.total_converted || 0}</TableCell>
                  <TableCell>{partner.created_at ? new Date(partner.created_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => partner.email && copyPartnerEmail(partner.email)}
                      disabled={!partner.email}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {copiedEmail === partner.email ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedEmail === partner.email ? "Copied!" : "Copy Email"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {allPartners && allPartners.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
              <div className="text-sm text-muted-foreground">
                Showing {allPartners.partners.length} of {allPartners.pagination.total} partners
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!allPartners.pagination.has_prev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {allPartners.pagination.page} of {allPartners.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!allPartners.pagination.has_next}
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

export default function AdminPartnersPage() {
  return <PartnersContent />
}
