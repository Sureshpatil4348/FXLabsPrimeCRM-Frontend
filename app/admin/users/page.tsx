import { Suspense } from "react"
import { UsersTableSkeleton } from "@/components/dashboard/skeleton-table"

type User = {
  user_id: string
  email: string | null
  region: string | null
  subscription_status: string | null
  subscription_ends_at: string | null
  has_paid: boolean
  total_spent: number
  converted_at: string | null
  created_at: string | null
  partner: { email: string | null; full_name: string | null } | null
}

type UsersResponse = {
  users: User[]
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
  filters_applied: {
    status: string | null
    region: string | null
  }
}

async function UsersContent() {
  try {
    const { cookies } = await import("next/headers")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/get-all-users`,
      {
        headers: {
          Cookie: (await cookies()).toString(),
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch users")
    }

    const data: UsersResponse = await res.json()

    return (
      <section className="grid gap-4">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold">All Users</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all users across admins, partners, and referrals.
          </p>
        </header>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-card">
            <h2 className="font-medium">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Region</th>
                  <th className="px-4 py-2 font-medium">Subscription Status</th>
                  <th className="px-4 py-2 font-medium">Subscription Ends At</th>
                  <th className="px-4 py-2 font-medium">Has Paid</th>
                  <th className="px-4 py-2 font-medium">Total Spent</th>
                  <th className="px-4 py-2 font-medium">Converted At</th>
                  <th className="px-4 py-2 font-medium">Created At</th>
                  <th className="px-4 py-2 font-medium">Partner Email</th>
                  <th className="px-4 py-2 font-medium">Partner Name</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.user_id} className="border-t border-border">
                    <td className="px-4 py-2">{u.email ?? "-"}</td>
                    <td className="px-4 py-2">{u.region ?? "-"}</td>
                    <td className="px-4 py-2">{u.subscription_status ?? "-"}</td>
                    <td className="px-4 py-2">
                      {u.subscription_ends_at ? new Date(u.subscription_ends_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">{u.has_paid ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">${u.total_spent.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {u.converted_at ? new Date(u.converted_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-2">{u.partner?.email ?? "-"}</td>
                    <td className="px-4 py-2">{u.partner?.full_name ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md border rounded-md p-4">
          <h2 className="text-red-600 font-semibold mb-2">Error</h2>
          <p className="text-sm">Unable to load users. Please try again later.</p>
        </div>
      </div>
    )
  }
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersContent />
    </Suspense>
  )
}
