"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SignupForm() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl">Sign Up</CardTitle>
          <CardDescription>Signup is currently disabled. Please contact admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Admin and partner accounts are created by administrators only.
            </p>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Return to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
