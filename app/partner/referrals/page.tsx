import { Suspense } from "react"
import { UsersTableSkeleton } from "@/components/dashboard/skeleton-table"
import ReferralsContentClient from "./referrals-content"

type PartnerUsersResponse = {
  partner_info: {
    email: string
    full_name: string | null
  }
  users: Array<{
    email: string
    region: string | null
    subscription_status: string
    subscription_ends_at: string | null
    created_at: string
    converted_at: string | null
  }>
  pagination: {
    current_page: number
    total_pages: number
    total_users: number
    per_page: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

async function ReferralsContent() {
  try {
    const { cookies } = await import("next/headers")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/get-partner-users-by-partner`,
      {
        headers: {
          Cookie: (await cookies()).toString(),
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch referrals")
    }

    const data: PartnerUsersResponse = await res.json()
    return <ReferralsContentClient data={data} />
  } catch (error) {
    return (
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-pretty">My Referrals</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-md border rounded-md p-4">
            <h2 className="text-red-600 font-semibold mb-2">Error</h2>
            <p>Unable to load referrals. Please try again later.</p>
          </div>
        </div>
      </main>
    )
  }
}

export default function MyReferralsPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <ReferralsContent />
    </Suspense>
  )
}
