"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

type SidebarProps = {
  role: "admin" | "partner"
  open: boolean
  onClose: () => void
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const adminItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/partners", label: "Partners" },
    { href: "/admin/users", label: "All Users" },
    { href: "/admin/referrals", label: "All Referrals" }
  ]
  const partnerItems = [
    { href: "/partner", label: "Dashboard" },
    { href: "/partner/referrals", label: "My Referrals" },
    { href: "/partner/add", label: "Add Referrals" },
    { href: "/partner/performance-report", label: "Performance Report" },
    { href: "/partner/settings", label: "Settings" },
  ]
  const items = role === "admin" ? adminItems : partnerItems

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/30 md:hidden transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed md:static z-30 top-14 md:top-0 left-0 h-[calc(100dvh-3.5rem)] md:h-[100dvh] w-72 shrink-0 border-r border-border bg-[var(--sidebar)]",
          "transition-transform md:transition-none",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Sidebar"
      >
        <nav className="p-3">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn("block rounded-md px-3 py-2 text-sm hover:bg-secondary")}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
