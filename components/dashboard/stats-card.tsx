import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <Card className="border border-border shadow-sm min-w-0">
      <CardHeader className="px-4 pt-4 pb-0">
        <CardTitle className="text-sm text-muted-foreground break-words text-pretty">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <p className="text-2xl font-semibold break-words">{String(value)}</p>
      </CardContent>
    </Card>
  )
}
