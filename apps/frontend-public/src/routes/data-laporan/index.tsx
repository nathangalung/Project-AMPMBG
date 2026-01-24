import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { DataSummaryCards } from "@/components/dashboard/data-summary-cards"
import { DataFilters, type FilterValues } from "@/components/dashboard/data-filters"
import { DataTable, type ReportRow } from "@/components/dashboard/data-table"
import { reportsService, type ReportsQuery, type ReportCategory, type ReportStatus } from "@/services/reports"

export const Route = createFileRoute("/data-laporan/")({
  component: DataLaporanPage,
})

const INITIAL_FILTERS: FilterValues = {
  startDate: "",
  endDate: "",
  province: "",
  city: "",
  district: "",
  category: "",
  status: "",
}

function DataLaporanPage() {
  const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTERS)

  const query = useMemo<ReportsQuery>(() => ({
    limit: 50,
    ...(filters.category && { category: filters.category as ReportCategory }),
    ...(filters.province && { provinceId: filters.province }),
    ...(filters.city && { cityId: filters.city }),
    ...(filters.district && { districtId: filters.district }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.status && { status: filters.status as ReportStatus }),
  }), [filters])

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports", "public", query],
    queryFn: () => reportsService.getReports(query),
  })

  const tableData: ReportRow[] = useMemo(() => {
    if (!reportsData?.data) return []
    return reportsData.data.map((report) => ({
      id: report.id,
      date: report.incidentDate.split("T")[0],
      city: report.city,
      province: report.province,
      district: report.district,
      category: report.category,
      status: report.status, 
      description: report.title || (report.description.length > 50 
        ? report.description.substring(0, 50) + "..." 
        : report.description),
    }))
  }, [reportsData])

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-general-20">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16">
        
        {/* FLUID CONTAINER: Padding Konsisten */}
        <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
          
          <div className="mb-10 md:mb-12">
            {/* Typography: Blue-100 untuk judul agar terlihat formal */}
            <h1 className="h3 font-heading text-blue-100 mb-3">Data dan Statistik Laporan MBG</h1>
            <p className="body-md text-general-60 max-w-3xl">
              Pantau perkembangan laporan masyarakat secara transparan. Data ini diperbarui secara berkala untuk memastikan akuntabilitas program.
            </p>
          </div>
          
          <div className="space-y-8">
            <DataSummaryCards />
            
            <DataFilters onFilter={handleFilterChange} />
            
            {isLoading ? (
              <div className="flex items-center justify-center py-24 bg-white/50 border border-dashed border-blue-20 rounded-2xl">
                <Loader2 className="w-10 h-10 animate-spin text-blue-100" />
              </div>
            ) : (
              <>
                <DataTable data={tableData} />
                
                {tableData.length === 0 && (
                  <div className="text-center py-16 bg-white border border-general-30 border-dashed rounded-2xl">
                    <p className="text-general-80 body-md font-medium">Tidak ada laporan yang sesuai dengan filter Anda.</p>
                    <p className="text-general-50 text-sm mt-1">Coba atur ulang tanggal atau kategori pencarian.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}