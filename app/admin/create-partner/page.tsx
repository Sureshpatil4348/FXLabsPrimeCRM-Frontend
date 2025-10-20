"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PartnerFormData = {
  email: string
  full_name: string
  commission_percent: number // Integer percentage (0-100)
  password: string
}

export default function CreatePartnerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PartnerFormData>({
    email: "",
    full_name: "",
    commission_percent: 15,
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic client-side checks
    if (!formData.email || !formData.full_name || !formData.password) {
      setError("Please fill in all required fields")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }
    if (formData.commission_percent < 0 || formData.commission_percent > 100) {
      setError("Commission percent must be between 0 and 100")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/create-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.message || "Failed to create partner")
        return
      }

  const data = await res.json()
  setSuccess(data.message || `Partner ${formData.full_name} created with ${formData.email}`)

      // Reset form
      setFormData({
        email: "",
        full_name: "",
        commission_percent: 15,
        password: "",
      })
    } catch (err) {
      setError("Unable to create partner. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Partner</h1>
        <p className="text-muted-foreground">Add a new partner to the system</p>
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
          <CardTitle>Partner Details</CardTitle>
          <CardDescription>Enter the information for the new partner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="partner@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="commission_percent">Commission Percent</Label>
              <Input
                id="commission_percent"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="15"
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Partner..." : "Create Partner"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dialog removed - admin auth via headers */}
    </div>
  )
}