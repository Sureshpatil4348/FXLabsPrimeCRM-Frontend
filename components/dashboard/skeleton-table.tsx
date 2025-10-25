import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
            <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function UsersTableSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Skeleton className="h-10 w-full" />
      </div>
      <TableSkeleton />
    </div>
  )
}

export function PartnersTableSkeleton() {
  return (
    <div className="grid gap-4">
      <TableSkeleton />
    </div>
  )
}
