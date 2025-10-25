"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Partner = {
  partner_id: string
  email: string
  full_name: string | null
  commission_percent: number
  total_revenue: number
  total_added: number
  total_converted: number
  created_at: string
}

type PartnersResponse = {
  partners: Partner[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters: {
    sort_by: string
  }
}

export default function PartnersContentClient({ data }: { data: PartnersResponse }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

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
  const totalPartners = data.partners.length
  const totalRevenue = data.partners.reduce((sum, p) => sum + p.total_revenue, 0)
  const totalAdded = data.partners.reduce((sum, p) => sum + p.total_added, 0)
  const totalConverted = data.partners.reduce((sum, p) => sum + p.total_converted, 0)

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
              {data.partners.map((partner) => (
                <TableRow key={partner.partner_id}>
                  <TableCell className="font-medium">{partner.full_name || "-"}</TableCell>
                  <TableCell>{partner.email}</TableCell>
                  <TableCell>{partner.commission_percent}%</TableCell>
                  <TableCell>{currency(partner.total_revenue)}</TableCell>
                  <TableCell>{partner.total_added}</TableCell>
                  <TableCell>{partner.total_converted}</TableCell>
                  <TableCell>{new Date(partner.created_at).toLocaleDateString()}</TableCell>
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
