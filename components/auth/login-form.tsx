"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { saveSession } from "@/lib/auth"

type LoginFormProps = {
  role: "admin" | "partner"
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const title = role === "admin" ? "Admin Login" : "partner Login"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch("/api/custom-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        // Try to read error from body if present
        try {
          const err = await res.json()
          setError(err?.message || "Invalid email or password for this role.")
        } catch {
          setError("Invalid email or password for this role.")
        }
        return
      }

  const payload = (await res.json()) as { success?: boolean }

      if (!payload.success) {
        setError("Unexpected response from server. Please try again.")
        return
      }

      // Token is now only stored in httpOnly cookie by the server
      // Session is tracked via cookie, no localStorage needed
      saveSession({ email, role })
      router.push(role === "admin" ? "/admin" : "/partner")
    } catch (err) {
      setError("Unable to sign in. Please try again.")
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
          <CardDescription>Welcome back. Please sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
              {role === "partner" ? (
                <Link href="/signup" className="text-primary hover:underline">
                  {"Don’t have an account? "}
                  <span className="font-medium">Sign up</span>
                </Link>
              ) : (
                <span aria-hidden className="text-muted-foreground">
                  {" "}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
