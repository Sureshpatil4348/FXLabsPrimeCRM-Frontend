"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { DashboardProvider } from "./dashboard-provider"

function DashboardContent({
  role,
  children,
}: {
  role: "admin" | "partner"
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

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
              {/* Page Content */}
              <div className="p-4 md:p-6 h-full overflow-y-auto">
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
      <DashboardContent role={role}>
        {children}
      </DashboardContent>
    </DashboardProvider>
  )
}
