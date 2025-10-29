import { Suspense } from "react"
import { UsersTableSkeleton } from "@/components/dashboard/skeleton-table"
import ReferralsContentClient from "./referrals-content"

export default function MyReferralsPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <ReferralsContentClient />
    </Suspense>
  )
}
