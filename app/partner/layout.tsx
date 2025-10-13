import type React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function partnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="partner">{children}</DashboardShell>
}
