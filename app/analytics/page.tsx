import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container max-w-screen-xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time insights into conversion performance and usage patterns.
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
