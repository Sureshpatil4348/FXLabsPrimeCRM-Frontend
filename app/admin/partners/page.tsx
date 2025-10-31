"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Copy, Check, Edit, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

function PartnersContent() {
  const { allPartners, loading, errors, loadAllPartners } = useDashboardStore()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [selectedPartnerEmail, setSelectedPartnerEmail] = useState<string | null>(null)
  const [partnerUsersData, setPartnerUsersData] = useState<any>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [modalCurrentPage, setModalCurrentPage] = useState(1)
  const [modalPaginationLoading, setModalPaginationLoading] = useState(false)
  const { toast } = useToast()

  // Edit modal state
  const [editingPartner, setEditingPartner] = useState<any>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editFullName, setEditFullName] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const [editCommissionPercent, setEditCommissionPercent] = useState("")
  const [editCommissionSlabs, setEditCommissionSlabs] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Always load data with pagination on mount or when page changes
    const loadData = async () => {
      setPaginationLoading(true)
      try {
        await loadAllPartners({ page: currentPage, limit: PAGINATION_LIMIT })
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
    if (!allPartners) return
    const { total_pages } = allPartners.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    // Only update if the clamped page differs from current page
    if (clamped !== currentPage) {
      setCurrentPage(clamped)
    }
  }

  const openPartnerUsersModal = async (partnerEmail: string) => {
    setSelectedPartnerEmail(partnerEmail)
    setModalCurrentPage(1)
    setModalLoading(true)
    setModalError("")
    setPartnerUsersData(null)

    try {
      const response = await fetch(`/api/get-partner-users-by-partner?page=1&limit=${PAGINATION_LIMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partner_email: partnerEmail })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch partner users")
      }

      const result = await response.json()
      setPartnerUsersData(result)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setModalLoading(false)
    }
  }

  const handleModalPageChange = async (page: number) => {
    if (!selectedPartnerEmail || !partnerUsersData) return

    const { total_pages } = partnerUsersData.pagination
    const clamped = Math.min(Math.max(page, 1), Math.max(total_pages, 1))
    
    if (clamped === modalCurrentPage) return

    setModalPaginationLoading(true)
    setModalError("")

    try {
      const response = await fetch(`/api/get-partner-users-by-partner?page=${clamped}&limit=${PAGINATION_LIMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partner_email: selectedPartnerEmail })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch partner users")
      }

      const result = await response.json()
      setPartnerUsersData(result)
      setModalCurrentPage(clamped)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setModalPaginationLoading(false)
    }
  }

  const closeModal = () => {
    setSelectedPartnerEmail(null)
    setPartnerUsersData(null)
    setModalError("")
    setModalCurrentPage(1)
  }

  const handleEditClick = (partner: any) => {
    setEditingPartner(partner)
    setEditEmail(partner.email || "")
    setEditFullName(partner.full_name || "")
    setEditIsActive(partner.is_active ?? true)
    setEditCommissionPercent(partner.commission_percent?.toString() || "")
    // Convert existing slabs to string format for input fields
    setEditCommissionSlabs((partner.commission_slabs?.slabs || []).map((slab: any) => ({
      min_revenue: slab.min_revenue?.toString() || "",
      max_revenue: slab.max_revenue?.toString() || "",
      commission_percent: slab.commission_percent?.toString() || ""
    })))
    setValidationErrors({})
  }

  const handleCloseEdit = () => {
    setEditingPartner(null)
    setEditEmail("")
    setEditFullName("")
    setEditIsActive(true)
    setEditCommissionPercent("")
    setEditCommissionSlabs([])
    setIsSubmitting(false)
    setValidationErrors({})
  }

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) return "Email is required"
    if (!emailRegex.test(email)) return "Invalid email format"
    return ""
  }

  const validateFullName = (fullName: string) => {
    if (!fullName.trim()) return "Full name is required"
    if (fullName.trim().length < 2) return "Full name must be at least 2 characters"
    return ""
  }

  const validateCommissionPercent = (percent: string) => {
    if (!percent.trim()) return ""
    const num = parseFloat(percent)
    if (isNaN(num)) return "Commission percent must be a valid number"
    if (num < 0) return "Commission percent cannot be negative"
    if (num > 100) return "Commission percent cannot exceed 100"
    return ""
  }

  const validateCommissionSlabs = (slabs: any[]) => {
    const errors: {[key: string]: string} = {}

    slabs.forEach((slab, index) => {
      // Skip validation for completely empty slabs (newly added but not filled)
      const hasAnyValue = slab.min_revenue || slab.max_revenue || slab.commission_percent
      if (!hasAnyValue) return

      const minRevenue = parseFloat(slab.min_revenue)
      const maxRevenue = slab.max_revenue ? parseFloat(slab.max_revenue) : null
      const commissionPercent = parseFloat(slab.commission_percent)

      if (isNaN(minRevenue) || minRevenue < 0) {
        errors[`slab_${index}_min`] = "Minimum revenue must be a non-negative number"
      }

      if (maxRevenue !== null && (isNaN(maxRevenue) || maxRevenue < 0)) {
        errors[`slab_${index}_max`] = "Maximum revenue must be a non-negative number"
      }

      if (maxRevenue !== null && maxRevenue <= minRevenue) {
        errors[`slab_${index}_max`] = "Maximum revenue must be greater than minimum revenue"
      }

      if (isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
        errors[`slab_${index}_commission`] = "Commission percent must be between 0 and 100"
      }
    })

    // Check for overlapping ranges - compare all pairs
    const filledSlabsWithIndex = slabs
      .map((slab, index) => ({ slab, index }))
      .filter(({ slab }) => slab.min_revenue || slab.max_revenue || slab.commission_percent)
    
    for (let i = 0; i < filledSlabsWithIndex.length; i++) {
      const { slab: slabA, index: indexA } = filledSlabsWithIndex[i]
      const minA = parseFloat(slabA.min_revenue)
      const maxA = slabA.max_revenue ? parseFloat(slabA.max_revenue) : Infinity
      
      for (let j = i + 1; j < filledSlabsWithIndex.length; j++) {
        const { slab: slabB, index: indexB } = filledSlabsWithIndex[j]
        const minB = parseFloat(slabB.min_revenue)
        const maxB = slabB.max_revenue ? parseFloat(slabB.max_revenue) : Infinity
        
        // Check if ranges overlap (use < for exclusive boundaries)
        if (minA < maxB && minB < maxA) {
          errors[`slab_${indexA}_overlap`] = "Commission slabs cannot overlap"
          errors[`slab_${indexB}_overlap`] = "Commission slabs cannot overlap"
        }
      }
    }

    return errors
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    const emailError = validateEmail(editEmail)
    if (emailError) errors.email = emailError

    const fullNameError = validateFullName(editFullName)
    if (fullNameError) errors.fullName = fullNameError

    const commissionError = validateCommissionPercent(editCommissionPercent)
    if (commissionError) errors.commissionPercent = commissionError

    // Only validate slabs if there are any filled slabs
    const filledSlabs = editCommissionSlabs.filter(slab =>
      slab.min_revenue || slab.max_revenue || slab.commission_percent
    )
    if (filledSlabs.length > 0) {
      const slabErrors = validateCommissionSlabs(editCommissionSlabs)
      Object.assign(errors, slabErrors)
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Commission slab management functions
  const addCommissionSlab = () => {
    const newSlab = {
      min_revenue: "",
      max_revenue: "",
      commission_percent: ""
    }
    setEditCommissionSlabs([...editCommissionSlabs, newSlab])
  }

  const updateCommissionSlab = (index: number, field: string, value: string) => {
    const updatedSlabs = [...editCommissionSlabs]
    updatedSlabs[index] = { ...updatedSlabs[index], [field]: value }
    setEditCommissionSlabs(updatedSlabs)
  }

  const removeCommissionSlab = (index: number) => {
    const updatedSlabs = editCommissionSlabs.filter((_, i) => i !== index)
    setEditCommissionSlabs(updatedSlabs)
  }

  const handleSaveEdit = async () => {
    if (!editingPartner) return

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: any = {
        partner_id: editingPartner.partner_id,
        email: editEmail !== editingPartner.email ? editEmail : undefined,
        full_name: editFullName !== editingPartner.full_name ? editFullName : undefined,
        is_active: editIsActive !== editingPartner.is_active ? editIsActive : undefined,
        commission_percent: editCommissionPercent !== editingPartner.commission_percent?.toString() ? parseFloat(editCommissionPercent) : undefined
      }

      // Handle commission slabs
      const filledSlabs = editCommissionSlabs.filter(slab =>
        slab.min_revenue || slab.max_revenue || slab.commission_percent
      )

      if (filledSlabs.length > 0) {
        // Validate that all filled slabs are complete
        const incompleteSlabs = filledSlabs.filter(slab =>
          !slab.min_revenue || !slab.commission_percent ||
          (slab.max_revenue && parseFloat(slab.max_revenue) <= parseFloat(slab.min_revenue))
        )

        if (incompleteSlabs.length > 0) {
          toast({
            title: "Incomplete Slabs",
            description: "Please complete all commission slab fields or remove incomplete slabs",
            variant: "destructive"
          })
          return
        }

        const processedSlabs = filledSlabs.map(slab => ({
          min_revenue: parseFloat(slab.min_revenue),
          max_revenue: slab.max_revenue ? parseFloat(slab.max_revenue) : null,
          commission_percent: parseFloat(slab.commission_percent)
        }))

        const existingSlabs = editingPartner.commission_slabs?.slabs || []
        const slabsChanged = processedSlabs.length !== existingSlabs.length ||
          processedSlabs.some((newSlab, idx) => {
            const existingSlab = existingSlabs[idx]
            return !existingSlab ||
              newSlab.min_revenue !== existingSlab.min_revenue ||
              newSlab.max_revenue !== existingSlab.max_revenue ||
              newSlab.commission_percent !== existingSlab.commission_percent
          })

        if (slabsChanged) {
          updateData.commission_slabs = { slabs: processedSlabs }
        }
      } else if (editingPartner.commission_slabs?.slabs?.length > 0) {
        // If all slabs were removed
        updateData.commission_slabs = { slabs: [] }
      }

      // Check if there are any changes
      const hasChanges = Object.values(updateData).some(value =>
        value !== undefined && value !== null
      )

      if (!hasChanges) {
        toast({
          title: "No Changes",
          description: "No changes were made to the partner",
          variant: "default"
        })
        handleCloseEdit()
        return
      }

      const response = await fetch("/api/update-partner-data", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update partner",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Partner updated successfully",
        variant: "default"
      })

      handleCloseEdit()
      // Reload the current page data
      await loadAllPartners({ page: currentPage, limit: PAGINATION_LIMIT })
    } catch (error) {
      console.error("Error updating partner:", error)
      toast({
        title: "Error",
        description: "Failed to update partner. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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

  // Only show skeleton on initial load, not on pagination
  if (loading.allPartners && !allPartners) {
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
                  <TableCell className="font-medium">
                    <button
                      onClick={() => partner.email && openPartnerUsersModal(partner.email)}
                      className="inline-flex items-center px-3 py-2 h-9 w-40 rounded-md border border-input bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors truncate"
                    >
                      {partner.full_name || "-"}
                    </button>
                  </TableCell>
                  <TableCell
                    onMouseEnter={() => setHoveredEmail(partner.email)}
                    onMouseLeave={() => setHoveredEmail(null)}
                    onClick={() => partner.email && copyPartnerEmail(partner.email)}
                    className="cursor-pointer relative"
                  >
                    <div className="flex items-center gap-2 group">
                      <span>{partner.email}</span>
                      {hoveredEmail === partner.email && (
                        copiedEmail === partner.email ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0 absolute right-0" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground shrink-0 absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{partner.commission_percent}%</TableCell>
                  <TableCell>{currency(partner.total_revenue || 0)}</TableCell>
                  <TableCell>{partner.total_added || 0}</TableCell>
                  <TableCell>{partner.total_converted || 0}</TableCell>
                  <TableCell>{partner.created_at ? new Date(partner.created_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleEditClick(partner)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
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
                  disabled={paginationLoading || !allPartners.pagination.has_prev}
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
                  disabled={paginationLoading || !allPartners.pagination.has_next}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Partner Users */}
      {selectedPartnerEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-4xl bg-white border border-border rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">Partner Users</h2>
                {partnerUsersData?.partner_info && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {partnerUsersData.partner_info.full_name || partnerUsersData.partner_info.email}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : modalError ? (
                <div className="text-sm text-red-600 p-4 bg-red-50 border border-red-200 rounded-md">
                  {modalError}
                </div>
              ) : partnerUsersData?.users?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-border bg-muted/30">
                        <th className="py-3 px-4 font-medium">Email</th>
                        <th className="py-3 px-4 font-medium">Region</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Subscription Ends</th>
                        <th className="py-3 px-4 font-medium">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerUsersData.users.map((user: any) => (
                        <tr key={user.email} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 break-all">{user.email}</td>
                          <td className="py-3 px-4">{user.region || "—"}</td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                              {user.subscription_status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.subscription_ends_at ? new Date(user.subscription_ends_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  No users found for this partner.
                </div>
              )}
            </div>

            {/* Footer with Pagination */}
            {partnerUsersData?.pagination?.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                <div className="text-sm text-muted-foreground">
                  Showing {partnerUsersData.users.length} of {partnerUsersData.pagination.total_users} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModalPageChange(modalCurrentPage - 1)}
                    disabled={!partnerUsersData.pagination.has_previous_page || modalPaginationLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {partnerUsersData.pagination.current_page} of {partnerUsersData.pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModalPageChange(modalCurrentPage + 1)}
                    disabled={!partnerUsersData.pagination.has_next_page || modalPaginationLoading}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
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
              <h2 className="text-lg font-semibold">Edit Partner</h2>
              <button
                onClick={handleCloseEdit}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">Email</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: "" }))
                    }
                  }}
                  placeholder="partner@example.com"
                  className={`bg-background border-border ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">Full Name</Label>
                <Input
                  type="text"
                  value={editFullName}
                  onChange={(e) => {
                    setEditFullName(e.target.value)
                    if (validationErrors.fullName) {
                      setValidationErrors(prev => ({ ...prev, fullName: "" }))
                    }
                  }}
                  placeholder="Partner Full Name"
                  className={`bg-background border-border ${validationErrors.fullName ? 'border-red-500' : ''}`}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">Commission Percent</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={editCommissionPercent}
                  onChange={(e) => {
                    setEditCommissionPercent(e.target.value)
                    if (validationErrors.commissionPercent) {
                      setValidationErrors(prev => ({ ...prev, commissionPercent: "" }))
                    }
                  }}
                  placeholder="10.5"
                  className={`bg-background border-border ${validationErrors.commissionPercent ? 'border-red-500' : ''}`}
                />
                {validationErrors.commissionPercent && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.commissionPercent}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label className="block text-sm font-medium text-foreground">Active Status</Label>
                <Switch
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
              </div>

              {/* Commission Slabs Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="block text-sm font-medium text-foreground">Commission Slabs</Label>
                    <p className="text-xs text-muted-foreground mt-1">Optional tiered commission rates based on revenue</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCommissionSlab}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Slab
                  </Button>
                </div>

                <div className="space-y-3">
                  {editCommissionSlabs.map((slab, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Slab {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCommissionSlab(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="block text-xs font-medium text-foreground mb-1">Min Revenue ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={slab.min_revenue}
                            onChange={(e) => {
                              updateCommissionSlab(index, 'min_revenue', e.target.value)
                              const errorKey = `slab_${index}_min`
                              if (validationErrors[errorKey]) {
                                setValidationErrors(prev => ({ ...prev, [errorKey]: "" }))
                              }
                            }}
                            placeholder="0"
                            className={`bg-background border-border text-sm ${validationErrors[`slab_${index}_min`] ? 'border-red-500' : ''}`}
                          />
                          {validationErrors[`slab_${index}_min`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`slab_${index}_min`]}</p>
                          )}
                        </div>

                        <div>
                          <Label className="block text-xs font-medium text-foreground mb-1">Max Revenue ($)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={slab.max_revenue}
                            onChange={(e) => {
                              updateCommissionSlab(index, 'max_revenue', e.target.value)
                              const errorKey = `slab_${index}_max`
                              if (validationErrors[errorKey]) {
                                setValidationErrors(prev => ({ ...prev, [errorKey]: "" }))
                              }
                            }}
                            placeholder="Leave empty for unlimited"
                            className={`bg-background border-border text-sm ${validationErrors[`slab_${index}_max`] ? 'border-red-500' : ''}`}
                          />
                          {validationErrors[`slab_${index}_max`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`slab_${index}_max`]}</p>
                          )}
                        </div>

                        <div>
                          <Label className="block text-xs font-medium text-foreground mb-1">Commission (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={slab.commission_percent}
                            onChange={(e) => {
                              updateCommissionSlab(index, 'commission_percent', e.target.value)
                              const errorKey = `slab_${index}_commission`
                              if (validationErrors[errorKey]) {
                                setValidationErrors(prev => ({ ...prev, [errorKey]: "" }))
                              }
                            }}
                            placeholder="10.5"
                            className={`bg-background border-border text-sm ${validationErrors[`slab_${index}_commission`] ? 'border-red-500' : ''}`}
                          />
                          {validationErrors[`slab_${index}_commission`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`slab_${index}_commission`]}</p>
                          )}
                        </div>
                      </div>

                      {validationErrors[`slab_${index}_overlap`] && (
                        <p className="text-red-500 text-xs mt-2">{validationErrors[`slab_${index}_overlap`]}</p>
                      )}
                    </div>
                  ))}

                  {editCommissionSlabs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No commission slabs configured</p>
                      <p className="text-xs mt-1">Click &quot;Add Slab&quot; to create tiered commission rates (optional)</p>
                    </div>
                  )}
                </div>
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
    </div>
  )
}

export default function AdminPartnersPage() {
  return <PartnersContent />
}
