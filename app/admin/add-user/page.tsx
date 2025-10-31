"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateAndParseCSV } from "@/lib/csv-validation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UserFormData = {
  emails: string
  region: string
  trial_days: number
}

type CreateUserResponse = {
  message: string
  summary: {
    created: number
    existing: number
    failed: number
    emails_sent?: number
  }
  created_users: Array<{ 
    email: string
    email_sent?: boolean
    email_error?: string | null
  }>
  existing_users: Array<{ email: string; reason?: string }>
  failed_users: Array<any>
  trial_days: number
  region?: string
}

export default function AddUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UserFormData>({
    emails: "",
    region: "India",
    trial_days: 30,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CreateUserResponse | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvEmails, setCsvEmails] = useState<string[]>([])
  const [trialOption, setTrialOption] = useState<string>("30")
  const [customTrialDays, setCustomTrialDays] = useState<number>(30)

  const previewEmails = useMemo(() => {
    const fromText = formData.emails
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const merged = new Set<string>([...fromText, ...csvEmails])
    return Array.from(merged)
  }, [formData.emails, csvEmails])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const fromText = formData.emails
      .split(/[\,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
    const emailStrings = Array.from(new Set<string>([...fromText, ...csvEmails]))

    if (emailStrings.length === 0) {
      setError("Please provide at least one email address")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emailStrings.filter((email) => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      setError(`Invalid email format(s): ${invalidEmails.join(", ")}`)
      setLoading(false)
      return
    }

    if (!formData.region) {
      setError("Region is required")
      setLoading(false)
      return
    }

    // Validate custom trial days
    if (trialOption === "custom") {
      if (formData.trial_days < 0 || formData.trial_days > 365) {
        setError("Trial days must be between 0 and 365")
        setLoading(false)
        return
      }
    }

    const users = emailStrings.map((email) => ({ email }))

    try {
      const requestBody = { users, region: formData.region, trial_days: formData.trial_days }
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { message?: string; error?: string } | null
        throw new Error(errorData?.message || errorData?.error || "Failed to create users")
      }
      const data: CreateUserResponse = await response.json()
      setSuccess(data)
      setFormData({ emails: "", region: "India", trial_days: 30 })
      setTrialOption("30")
      setCustomTrialDays(30)
      setCsvFile(null)
      setCsvEmails([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Users</h1>
        <p className="text-muted-foreground">Create multiple users with trial access</p>
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
              <p>
                Summary: {success.summary.created} created, {success.summary.existing} existing, {success.summary.failed} failed
                {success.summary.emails_sent !== undefined && `, ${success.summary.emails_sent} emails sent`}
              </p>
              {success.region && <p className="text-sm">Region: {success.region}</p>}

              {success.created_users.length > 0 && (
                <div>
                  <p className="font-medium text-green-700">✅ Successfully Created:</p>
                  <ul className="list-disc list-inside text-sm ml-4">
                    {success.created_users.map((user, index) => (
                      <li key={index} className="text-green-600">
                        {user.email}
                        {user.email_sent === false && (
                          <span className="text-orange-600 ml-2">
                            ⚠️ Email not sent - Account created, contact admin to reset password and send email
                          </span>
                        )}
                        {user.email_error && (
                          <span className="text-red-600 ml-2">
                            (Error: {user.email_error})
                          </span>
                        )}
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

              <p className="text-xs text-muted-foreground mt-2">Trial period: {success.trial_days} days</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the information for the new users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email *</Label>
              <Textarea
                id="emails"
                value={formData.emails}
                onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                placeholder="user1@example.com, user2@example.com..."
                rows={5}
              />
              <p className="text-sm text-muted-foreground">Enter emails separated by commas or new lines.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Region is required. Defaulted to India.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial_days">Trial Days</Label>
              <Select
                value={trialOption}
                onValueChange={(value) => {
                  setTrialOption(value)
                  if (value !== "custom") {
                    setFormData({ ...formData, trial_days: parseInt(value, 10) })
                  } else {
                    setFormData({ ...formData, trial_days: customTrialDays })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trial days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {trialOption === "custom" && (
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={customTrialDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1
                    setCustomTrialDays(val)
                    setFormData({ ...formData, trial_days: val })
                  }}
                  placeholder="Enter custom days"
                />
              )}
              {trialOption === "custom" && (
                <p className="text-sm text-muted-foreground">Enter a number between 1 and 365 days.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv">Upload CSV (optional)</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  setCsvFile(file || null)
                  if (!file) return
                  try {
                    const result = await validateAndParseCSV(file)
                    if (result.error) {
                      setError(result.error)
                      setCsvFile(null)
                      setCsvEmails([])
                      return
                    }
                    setCsvEmails(result.emails)
                  } catch (err) {
                    setError("Failed to parse CSV file. Please ensure it has an Email column.")
                  }
                }}
              />
              {csvFile && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">Selected: {csvFile.name} ({csvEmails.length} emails)</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCsvFile(null)
                      setCsvEmails([])
                      const input = document.getElementById("csv") as HTMLInputElement | null
                      if (input) input.value = ""
                    }}
                  >
                    Clear CSV
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">We&apos;ll only extract valid emails from the CSV and de-duplicate them.</p>
            </div>

            {previewEmails.length > 0 && (
              <div className="space-y-2">
                <Label>Preview ({previewEmails.length})</Label>
                <div className="max-h-40 overflow-auto border rounded p-2 text-sm bg-muted/30">
                  <ul className="list-disc ml-4">
                    {previewEmails.map((em) => (
                      <li key={em}>{em}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Users"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}