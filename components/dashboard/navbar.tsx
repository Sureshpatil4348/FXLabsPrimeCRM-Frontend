"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSession, signOut, type Session } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { LogIn, BarChart3, Cpu, Users, DollarSign } from "lucide-react"

// Import the logo image
import blacklogo from "../../assets/blacklogo.png"

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void } = {}) {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on admin or partner dashboard
  const isOnDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/partner')

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setSession(getSession())
    }, 0)

    return () => clearTimeout(timer)
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Top spacing for content to scroll under navbar */}
      <div className="h-6 sm:h-8"></div>

      <header className="fixed top-4 left-4 right-4 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl shadow-black/10">
            <div className="px-4 sm:px-6 lg:px-8 relative">
              <div className="flex justify-between items-center h-[45px] sm:h-[55px] gap-2 sm:gap-4 lg:gap-8">
                {/* Logo Section */}
                <div className="flex items-center flex-shrink-0">
                  <Link
                    href="/"
                    className="group"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <Image
                      src={blacklogo}
                      alt="FxLabs Prime Logo"
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-all duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <span
                    className="ml-2 sm:ml-3 text-base sm:text-base md:text-xl text-emerald-700"
                    style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive', transform: 'translateY(6px)' }}
                  >
                    by Hextech
                  </span>
                </div>

              

                {/* Right Section - Account & Login */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {/* User Section */}
                  <div className="flex items-center">
                    {session?.email ? (
                      <>
                        <span className="text-sm text-muted-foreground hidden sm:inline mr-2">{session.email}</span>
                        <Button variant="outline" onClick={handleLogout}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Button
                        asChild
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm lg:text-base backdrop-blur-sm"
                      >
                        <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
                          <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Login</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
