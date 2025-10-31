"use client"

import { useDashboardStore } from "@/lib/dashboard-store"
import { PAGINATION_LIMIT } from "@/lib/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnersTableSkeleton } from "@/components/dashboard/skeleton-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Copy, Check, Edit, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function AdminsContent() {
  const { allAdmins, loading, errors, loadAllAdmins } = useDashboardStore()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const { toast } = useToast()

  // Edit modal state
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [editEmail, setEditEmail] = useState("")
  const [editFullName, setEditFullName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

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

  const validatePassword = (password: string, fieldName: string) => {
    if (!password.trim()) return `${fieldName} is required`
    if (password.length < 8) return `${fieldName} must be at least 8 characters`
    return ""
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    const emailError = validateEmail(editEmail)
    if (emailError) errors.email = emailError

    const fullNameError = validateFullName(editFullName)
    if (fullNameError) errors.fullName = fullNameError

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Edit functions
  const handleEditClick = (admin: any) => {
    setEditingAdmin(admin)
    setEditEmail(admin.email || "")
    setEditFullName(admin.full_name || "")
    setValidationErrors({})
  }

  const handleCloseEdit = () => {
    setEditingAdmin(null)
    setEditEmail("")
    setEditFullName("")
    setIsSubmitting(false)
    setValidationErrors({})
  }

  const handleSaveEdit = async () => {
    if (!editingAdmin) return

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
        existing_email: editingAdmin.email
      }

      // Handle email update
      if (editEmail !== editingAdmin.email) {
        updateData.email = editEmail
      }

      // Handle full name update
      if (editFullName !== editingAdmin.full_name) {
        updateData.full_name = editFullName
      }

      // Check if there are any changes
      const hasChanges = Object.keys(updateData).length > 1 // More than just existing_email

      if (!hasChanges) {
        toast({
          title: "No Changes",
          description: "No changes were made to the admin",
          variant: "default"
        })
        handleCloseEdit()
        return
      }

      const response = await fetch("/api/update-admin-data", {
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
          description: data.error || "Failed to update admin",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Admin updated successfully",
        variant: "default"
      })

      handleCloseEdit()
      // Reload the current page data
      await loadAllAdmins({ page: currentPage, limit: PAGINATION_LIMIT })
    } catch (error) {
      console.error("Error updating admin:", error)
      toast({
        title: "Error",
        description: "Failed to update admin. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(admin)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
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
                    </div>
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

      {/* Edit Admin Modal */}
      {editingAdmin && (
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
              <h2 className="text-lg font-semibold">Edit Admin</h2>
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
                  placeholder="admin@example.com"
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
                  placeholder="Admin Full Name"
                  className={`bg-background border-border ${validationErrors.fullName ? 'border-red-500' : ''}`}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                )}
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

export default function AdminAllAdminsPage() {
  return <AdminsContent />
}