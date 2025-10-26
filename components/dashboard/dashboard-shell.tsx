"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { DashboardProvider, useDashboard } from "./dashboard-provider"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

function DashboardContent({
  role,
  children,
}: {
  role: "admin" | "partner"
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { refreshData, isDataLoaded } = useDashboard()

  // Inline CSS variable overrides keep us within the token system
  const overrides: React.CSSProperties = {
    // Accent color: soft green #3ECF8E
    ["--primary" as any]: "#3ECF8E",
    ["--primary-foreground" as any]: "#ffffff",
    // Light gray sidebar #fafafa
    ["--sidebar" as any]: "#fafafa",
    // Subtle borders #eaeaea
    ["--border" as any]: "#eaeaea",
  }

  return (
    <div style={overrides} className="relative h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:bg-linear-to-br dark:from-[#19235d] dark:via-black dark:to-[#19235d] overflow-hidden flex flex-col transition-colors duration-300">
      <Navbar onToggleSidebar={() => setOpen((v) => !v)} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 mt-10">
        <div className="mx-auto max-w-screen-2xl h-full">
          <div className="grid md:grid-cols-[18rem_1fr] gap-4 h-full">
            {/* Sidebar Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
            </div>

            {/* Main Content Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg shadow-black/5 overflow-hidden">
              {/* Header with refresh button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dashboard
                  </h1>
                  {isDataLoaded && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Data Loaded
                    </div>
                  )}
                </div>
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </Button>
              </div>

              {/* Page Content */}
              <div className="p-4 md:p-6 h-[calc(100%-4rem)] overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export function DashboardShell({
  role,
  children,
}: {
  role: "admin" | "partner"
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <DashboardContent role={role} children={children} />
    </DashboardProvider>
  )
}
