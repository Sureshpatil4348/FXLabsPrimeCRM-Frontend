import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnersTableSkeleton } from "@/components/dashboard/skeleton-table"
import PartnersContentClient from "./partners-content"

type Partner = {
  partner_id: string
  email: string
  full_name: string | null
  commission_percent: number
  total_revenue: number
  total_added: number
  total_converted: number
  created_at: string
}

type PartnersResponse = {
  partners: Partner[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters: {
    sort_by: string
  }
}

async function PartnersContent() {
  try {
    const { cookies } = await import("next/headers")
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/get-all-partners`,
      {
        headers: {
          Cookie: (await cookies()).toString(),
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      throw new Error("Failed to fetch partners")
    }

    const data: PartnersResponse = await res.json()
    return <PartnersContentClient data={data} />
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Unable to load partners. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default function AdminPartnersPage() {
  return (
    <Suspense fallback={<PartnersTableSkeleton />}>
      <PartnersContent />
    </Suspense>
  )
}
