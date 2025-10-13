import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-balance text-xl md:text-2xl">TradeReferral Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild className="w-full">
            <Link href="/login/admin" aria-label="Admin Login">
              Admin Login
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/login/partner" aria-label="partner Login">
              Partner Login
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">{"© 2025 TradeReferral"}</p>
        </CardContent>
      </Card>
    </main>
  )
}
