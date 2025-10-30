"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Users, UserPlus, Shield, Building2, UserCheck, FileText } from "lucide-react"

type SidebarProps = {
  role: "admin" | "partner"
  open: boolean
  onClose: () => void
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const adminItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "All Users", icon: Users },
    
    { href: "/admin/partners", label: "All Partners", icon: Users },
    { href: "/admin/all-admins", label: "All Admins", icon: Building2 },
    { href: "/admin/add-user", label: "Create User", icon: UserPlus },
    
    
    { href: "/admin/create-partner", label: "Create Partner", icon: UserPlus },
    
    { href: "/admin/create-admin", label: "Create Admin", icon: Shield },
    { href: "/admin/partner-users", label: "Get Users by Partner", icon: UserCheck },
  ]

  const partnerItems = [
    { href: "/partner", label: "Dashboard", icon: BarChart3 },
    { href: "/partner/referrals", label: "My Referrals", icon: FileText },
    { href: "/partner/add", label: "Add Referrals", icon: UserPlus },
  ]

  const items = role === "admin" ? adminItems : partnerItems

  return (
    <aside className="h-full bg-transparent">
      <nav className="p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-2">
            {role === "admin" ? "Admin Panel" : "Partner Panel"}
          </h2>
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300",
                      isActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                    onClick={onClose}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </aside>
  )
}
