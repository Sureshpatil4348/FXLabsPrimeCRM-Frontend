"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function PartnersContent() {
  const { allPartners, loading, errors, loadAllPartners } = useDashboardStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

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
            onClick={() => loadAllPartners()}
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
          <Button onClick={() => loadAllPartners()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Partners
          </Button>
        </div>
      </div>
    )
  }

  const copyPartnerId = async (partnerId: string) => {
    try {
      await navigator.clipboard.writeText(partnerId)
      setCopiedId(partnerId)
      toast({
        title: "Partner ID copied",
        description: "Partner ID has been copied to clipboard",
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy partner ID to clipboard",
        variant: "destructive",
      })
    }
  }

  const currency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

  // Calculate statistics from the partners data
  const totalPartners = allPartners.partners.length
  const totalRevenue = allPartners.partners.reduce((sum, p) => sum + (p.total_earned || 0), 0)
  const totalAdded = allPartners.partners.reduce((sum, p) => sum + (p.total_users || 0), 0)
  const totalConverted = allPartners.partners.reduce((sum, p) => sum + (p.active_users || 0), 0)

  return (
    <div className="space-y-6">
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
                <TableHead>Commission</TableHead>
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
                  <TableCell>{partner.commission_rate}%</TableCell>
                  <TableCell>{currency(partner.total_earned || 0)}</TableCell>
                  <TableCell>{partner.total_users || 0}</TableCell>
                  <TableCell>{partner.active_users || 0}</TableCell>
                  <TableCell>{partner.created_at ? new Date(partner.created_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPartnerId(partner.partner_id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {copiedId === partner.partner_id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedId === partner.partner_id ? "Copied!" : "Copy ID"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPartnersPage() {
  return <PartnersContent />
}
