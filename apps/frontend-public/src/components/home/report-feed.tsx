import { useMemo, memo } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ReportCard, type ReportData } from "@/components/ui/report-card"
import { ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { reportsService } from "@/services/reports"
import { CATEGORY_LABELS, CATEGORY_VARIANTS, RELATION_LABELS } from "@/hooks/use-categories"

// Configuration for consistent date formatting throughout the feed
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" }

function ReportFeedComponent() {
  // Data Fetching
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports", "recent"],
    queryFn: () => reportsService.getRecent(),
    staleTime: 30000,
  })

  // Data Transformation
  const reports: ReportData[] = useMemo(() => {
    if (!reportsData?.data) return []
    
    return reportsData.data
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        category: CATEGORY_LABELS[r.category] || r.category,
        categoryVariant: CATEGORY_VARIANTS[r.category] || "info",
        title: r.title,
        location: r.location,
        date: new Date(r.incidentDate).toLocaleDateString("id-ID", DATE_FORMAT_OPTIONS),
        reporter: RELATION_LABELS[r.relation] || "Pelapor",
      }))
  }, [reportsData])

  return (
    <section className="py-16 md:py-24 bg-general-20 border-t border-general-30">
      
      <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-blue-100 mb-3">
              Laporan Terkini
            </h2>
            <p className="text-general-60 body-sm md:body-md leading-relaxed">
              Transparansi adalah kunci. Pantau laporan masyarakat yang baru saja masuk dan terverifikasi dari berbagai wilayah.
            </p>
          </div>
          
          <Link
            to="/data-laporan"
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-orange-100 text-general-20 font-heading font-medium rounded-lg hover:bg-orange-90 transition-all shadow-sm hover:shadow-md whitespace-nowrap group"
          >
            Lihat Semua Laporan
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* --- REPORT CARDS GRID --- */}
        {isLoading ? (
          // Loading State
          <div className="flex items-center justify-center py-20 bg-general-30/20 rounded-2xl border border-dashed border-general-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-100" />
          </div>
        ) : reports.length > 0 ? (
        
          // Data Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {reports.map((report) => (
              <div key={report.id} className="h-full flex flex-col">
                 <div className="flex-1 h-full [&>*]:h-full">
                    <ReportCard report={report} />
                 </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-general-20 rounded-2xl text-center border border-general-30">
            <div className="w-14 h-14 bg-general-30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-general-60" />
            </div>
            <p className="text-general-80 font-medium">Belum ada laporan masuk saat ini.</p>
          </div>
        )}

        {/* Mobile Button */}
        <div className="mt-8 md:hidden">
          <Link
            to="/data-laporan"
            className="flex items-center justify-center w-full px-6 py-3.5 bg-orange-100 text-general-20 font-bold rounded-lg hover:bg-orange-90 transition-colors shadow-sm"
          >
            Lihat Semua Laporan
          </Link>
        </div>

      </div>
    </section>
  )
}

export const ReportFeed = memo(ReportFeedComponent)