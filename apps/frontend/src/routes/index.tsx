import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"

const QuickStats = lazy(() =>
  import("@/components/home/quick-stats").then((m) => ({ default: m.QuickStats }))
)
const ReportFeed = lazy(() =>
  import("@/components/home/report-feed").then((m) => ({ default: m.ReportFeed }))
)

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<div className="h-32" />}>
          <QuickStats />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <ReportFeed />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
