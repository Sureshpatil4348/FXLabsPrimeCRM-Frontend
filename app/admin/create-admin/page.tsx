"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AdminFormData = {
  email: string
  full_name: string
  password: string
}

export default function CreateAdminPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    full_name: "",
    password: "",
  })
  const [currentAdminPassword, setCurrentAdminPassword] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.email || !formData.full_name || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setError(null)
    setShowPasswordDialog(true)
  }

  const handleFinalSubmit = async () => {
    if (!currentAdminPassword) {
      setError("Please enter your current admin password")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const requestBody = {
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        current_admin_password: currentAdminPassword
      }

      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string }
        throw new Error(errorData.error || "Failed to create admin")
      }

      const data = await response.json()
      setSuccess(data.message || "Admin created successfully")
      setFormData({
        email: "",
        full_name: "",
        password: "",
      })
      setCurrentAdminPassword("")
      setShowPasswordDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Admin</h1>
        <p className="text-muted-foreground">Add a new administrator to the system</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Details</CardTitle>
          <CardDescription>Enter the information for the new admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              Create Admin
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Admin Creation</DialogTitle>
              <DialogDescription>
                Please enter your current admin password to confirm the creation of a new admin account for <strong>{formData.full_name}</strong> ({formData.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="current_password">Your Current Admin Password</Label>
              <Input
                id="current_password"
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
                placeholder="Enter your admin password"
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || !currentAdminPassword}
              >
                {loading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
