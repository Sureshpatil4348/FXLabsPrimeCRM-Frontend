"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Mode = "single" | "bulk" | "csv"

function isValidEmail(email: string) {
  const e = email.trim()
  if (!e) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function normalizeEmails(list: string[]): string[] {
  const uniq = new Set<string>()
  for (const raw of list) {
    const e = raw.trim().toLowerCase()
    if (isValidEmail(e)) uniq.add(e)
  }
  return Array.from(uniq)
}

function parseCsvEmails(text: string): string[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const headerParts = lines[0].split(",").map((s) => s.trim().toLowerCase())
  const hasHeader = headerParts.some((h) => h === "email" || h === "emails")
  const emails: string[] = []

  if (hasHeader) {
    const idx = headerParts.findIndex((h) => h === "email" || h === "emails")
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",")
      const cell = (parts[idx] || "").trim()
      if (cell) emails.push(cell)
    }
  } else {
    for (const line of lines) {
      const parts = line.split(",").map((s) => s.trim())
      for (const p of parts) if (p) emails.push(p)
    }
  }
  return emails
}

export default function AddReferralsPage() {
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>("single")
  const [loading, setLoading] = useState(false)

  // Single mode
  const [single, setSingle] = useState("")

  // Bulk mode
  const [bulk, setBulk] = useState("")

  // CSV mode
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<string[]>([])

  const parsedBulk = useMemo(() => {
    if (!bulk.trim()) return []
    return bulk
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [bulk])

  const singleList = useMemo(() => (single.trim() ? [single.trim()] : []), [single])

  const combinedPreview = useMemo(() => {
    const all = [...singleList, ...parsedBulk, ...csvPreview]
    return normalizeEmails(all)
  }, [singleList, parsedBulk, csvPreview])

  async function handleCsvChange(file: File) {
    setCsvFile(file)
    try {
      const text = await file.text()
      const emails = parseCsvEmails(text)
      setCsvPreview(emails)
    } catch {
      toast({ title: "Failed to read CSV", variant: "destructive" })
    }
  }

  async function handleSave() {
    if (combinedPreview.length === 0) {
      toast({ title: "No valid emails to add", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: combinedPreview }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create users")
      }

      const data = await response.json()
      toast({ 
        title: "Users created", 
        description: `Created: ${data.summary.created}, Already exists: ${data.summary.already_exists}, Failed: ${data.summary.failed}` 
      })
      if (mode === "single") setSingle("")
      if (mode === "bulk") setBulk("")
      if (mode === "csv") {
        setCsvFile(null)
        setCsvPreview([])
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "An error occurred", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">Add Prospects</h1>
          <p className="text-muted-foreground">
            Choose an input method to add referral emails. We’ll validate, dedupe, and save them locally.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/partner/magic-link">
            <Button variant="outline">Generate Magic Link</Button>
          </Link>
          <Link href="/partner">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Methods</CardTitle>
          <CardDescription>Single email, bulk paste, or CSV upload (most scalable).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant={mode === "single" ? "default" : "outline"} onClick={() => setMode("single")}>
              Single email input
            </Button>
            <Button variant={mode === "bulk" ? "default" : "outline"} onClick={() => setMode("bulk")}>
              Bulk paste
            </Button>
            <Button variant={mode === "csv" ? "default" : "outline"} onClick={() => setMode("csv")}>
              CSV upload
            </Button>
          </div>

          {mode === "single" && (
            <div className="grid gap-3">
              <Label htmlFor="single">Email</Label>
              <Input
                id="single"
                type="email"
                placeholder="lead@example.com"
                value={single}
                onChange={(e) => setSingle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Add one email at a time with validation.</p>
            </div>
          )}

          {mode === "bulk" && (
            <div className="grid gap-3">
              <Label htmlFor="bulk">Paste emails (comma- or line-separated)</Label>
              <textarea
                id="bulk"
                rows={6}
                placeholder={"lead1@example.com, lead2@example.com\nlead3@example.com"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">We’ll split, validate, and dedupe.</p>
            </div>
          )}

          {mode === "csv" && (
            <div className="grid gap-3">
              <Label htmlFor="csv">Upload CSV file</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCsvChange(file)
                }}
              />
              <p className="text-xs text-muted-foreground">
                We’ll auto-detect an “email” column. Otherwise, we’ll scan for cells that look like emails.
              </p>
              {csvFile ? (
                <div className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium">{csvFile.name}</span>
                </div>
              ) : null}
            </div>
          )}

          <div className="grid gap-2">
            <div className="text-sm">
              <span className="font-medium">Preview</span> ({combinedPreview.length} valid email
              {combinedPreview.length === 1 ? "" : "s"})
            </div>
            {combinedPreview.length > 0 ? (
              <div className="rounded-md border border-border p-3 text-sm max-h-48 overflow-auto">
                <ul className="grid gap-1">
                  {combinedPreview.map((e) => (
                    <li key={e} className="truncate">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={combinedPreview.length === 0 || loading}>
              {loading ? "Creating..." : "Create users"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Add prospect emails to create user accounts. Emails will be validated and deduplicated.
      </p>
    </main>
  )
}
