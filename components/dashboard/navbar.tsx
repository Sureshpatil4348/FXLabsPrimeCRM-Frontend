"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSession, signOut, type Session } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    setSession(getSession())
  }, [])

  async function handleLogout() {
    try {
      // Call logout API to clear server-side cookies
      await fetch("/api/logout", { method: "POST" })
    } catch (error) {
      console.warn("Logout API call failed:", error)
    }
    
    // Clear client-side session
    signOut()
    setSession(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden bg-transparent"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>
          <Link href="/" className="font-semibold">
            FXLabsPrimeCRM
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {session?.email ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{session.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
