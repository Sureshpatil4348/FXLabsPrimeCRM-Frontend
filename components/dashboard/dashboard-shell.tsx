"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

export function DashboardShell({
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
    <div style={overrides}>
      <Navbar onToggleSidebar={() => setOpen((v) => !v)} />
      <div className="mx-auto max-w-screen-2xl grid md:grid-cols-[18rem_1fr]">
        <Sidebar role={role} open={open} onClose={() => setOpen(false)} />
        <main className="min-h-[calc(100dvh-3.5rem)] p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
