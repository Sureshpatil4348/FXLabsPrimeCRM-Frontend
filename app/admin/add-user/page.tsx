"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UserFormData = {
  emails: string
  default_region: string
  trial_days: number
}

type CreateUserResponse = {
  message: string
  summary: {
    created: number
    existing: number
    failed: number
  }
  created_users: Array<{ email: string }>
  existing_users: Array<{ email: string; reason: string }>
  failed_users: Array<any>
  trial_days: number
}

export default function AddUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UserFormData>({
    emails: "",
    default_region: "",
    trial_days: 30,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CreateUserResponse | null>(null)

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lines = formData.emails
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (lines.length === 0) {
      setError("Please provide at least one email address")
      return
    }

    // Parse emails and regions
    const users: Array<{ email: string; region?: string }> = []
    const invalidLines: string[] = []

    lines.forEach(line => {
      // Support formats: "email@domain.com" or "email@domain.com region"
      const parts = line.split(/\s+/)
      const email = parts[0].trim()
      const region = parts.slice(1).join(" ").trim() || formData.default_region || undefined

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        invalidLines.push(line)
      } else {
        users.push({ email, ...(region && { region }) })
      }
    })

    if (invalidLines.length > 0) {
      setError(`Invalid email format: ${invalidLines.join(", ")}`)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const requestBody = {
        users,
        trial_days: formData.trial_days
      }

      const response = await fetch("/api/create-user-by-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || "Failed to create users")
      }

      const data: CreateUserResponse = await response.json()
      setSuccess(data)
      setFormData({
        emails: "",
        default_region: "",
        trial_days: 30,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add Users</CardTitle>
            <CardDescription>
              Create multiple user accounts at once with trial access. Enter one email per line with optional region (e.g., "user@example.com India").
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  value={formData.emails}
                  onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                  placeholder="user1@example.com India&#10;user2@example.com USA&#10;user3@example.com"
                  rows={5}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter one email per line. Optionally add region after email (e.g., "user@example.com India")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_region">Default Region (Optional)</Label>
                <Input
                  id="default_region"
                  type="text"
                  value={formData.default_region}
                  onChange={(e) => setFormData({ ...formData, default_region: e.target.value })}
                  placeholder="e.g., India, USA (applied to emails without specific region)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trial_days">Trial Days</Label>
                <Input
                  id="trial_days"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.trial_days}
                  onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 30 })}
                  placeholder="30"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{success.message}</p>
                      <p>Summary: {success.summary.created} created, {success.summary.existing} existing, {success.summary.failed} failed</p>

                      {success.created_users.length > 0 && (
                        <div>
                          <p className="font-medium text-green-700">✅ Successfully Created:</p>
                          <ul className="list-disc list-inside text-sm ml-4">
                            {success.created_users.map((user, index) => (
                              <li key={index} className="text-green-600">
                                {user.email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {success.existing_users.length > 0 && (
                        <div>
                          <p className="font-medium text-yellow-700">⚠️ Already Exist:</p>
                          <ul className="list-disc list-inside text-sm ml-4">
                            {success.existing_users.map((user, index) => (
                              <li key={index} className="text-yellow-600">
                                {user.email} - {user.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {success.failed_users.length > 0 && (
                        <div>
                          <p className="font-medium text-red-700">❌ Failed to Create:</p>
                          <ul className="list-disc list-inside text-sm ml-4">
                            {success.failed_users.map((user, index) => (
                              <li key={index} className="text-red-600">
                                {user.email || `User ${index + 1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Trial period: {success.trial_days} days
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Users"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}