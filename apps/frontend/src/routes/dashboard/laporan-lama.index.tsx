import { createFileRoute, Link } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search, 
  AlertCircle,
  XCircle
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"

export const Route = createFileRoute("/dashboard/laporan-lama/")({
  component: LaporanLamaPage,
})

// --- 1. DATA DUMMY (Disesuaikan) ---
const generateDummyData = () => {
  const categories = [
    "Operasional Dapur",
    "Keracunan dan Masalah Kesehatan",
    "Kualitas dan Keamanan Dapur",
    "Implementasi Program",
    "Kebijakan dan Anggaran",
    "Dampak Sosial dan Ekonomi"
  ]
  const locations = [
    { prov: "Jawa Barat", city: "Kab. Bogor", dist: "Cibinong" },
    { prov: "Sumatra Utara", city: "Kota Medan", dist: "Medan Johor" },
    { prov: "DKI Jakarta", city: "Jakarta Selatan", dist: "Tebet" },
    { prov: "Jawa Timur", city: "Kota Surabaya", dist: "Gubeng" },
    { prov: "Jawa Tengah", city: "Kota Solo", dist: "Banjarsari" },
    { prov: "Jawa Barat", city: "Kota Bandung", dist: "Cicendo" },
    { prov: "Sumatra Utara", city: "Kab. Deli Serdang", dist: "Percut Sei Tuan" },
  ]
  
  // Status: Cuma Ditolak atau Terverifikasi
  const statuses = [
    { label: "Terverifikasi", variant: "green" },
    { label: "Terverifikasi", variant: "green" },
    { label: "Terverifikasi", variant: "green" },
    { label: "Ditolak", variant: "red" }, 
  ]

  // Tingkat Permasalahan
  const riskLevels = ["Tinggi", "Sedang", "Rendah"]

  return Array.from({ length: 60 }, (_, i) => { 
    const loc = locations[i % locations.length]
    const statusObj = statuses[i % statuses.length]
    const risk = riskLevels[i % riskLevels.length]
    
    // Tanggal mundur (History)
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const year = i < 10 ? "2025" : "2024"
    
    return {
      id: i + 1,
      date: `${year}-${month}-${day}`,
      displayDate: `${day}/${month}/${year}`,
      province: loc.prov,
      city: loc.city,
      district: loc.dist,
      category: categories[i % categories.length],
      status: statusObj.label,
      variant: statusObj.variant,
      riskLevel: risk,
    }
  })
}

const allDataLaporan = generateDummyData()

// --- 2. TYPES ---
interface FilterValues {
  startDate: string
  endDate: string
  province: string
  city: string
  district: string
  category: string
}

// --- 3. MAIN PAGE COMPONENT ---
function LaporanLamaPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State Filter
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    startDate: "",
    endDate: "",
    province: "",
    city: "",
    district: "",
    category: ""
  })

  // --- LOGIC: FILTERING ---
  const filteredData = useMemo(() => {
    return allDataLaporan.filter(item => {
      if (activeFilters.startDate && item.date < activeFilters.startDate) return false
      if (activeFilters.endDate && item.date > activeFilters.endDate) return false
      if (activeFilters.province && item.province !== activeFilters.province) return false
      if (activeFilters.city && item.city !== activeFilters.city) return false
      if (activeFilters.district && item.district !== activeFilters.district) return false
      if (activeFilters.category && item.category !== activeFilters.category) return false
      return true
    })
  }, [activeFilters])

  useEffect(() => { setCurrentPage(1) }, [activeFilters])

  // Logic Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const goToFirst = () => setCurrentPage(1)
  const goToLast = () => setCurrentPage(totalPages)
  const goToPrev = () => setCurrentPage(p => Math.max(1, p - 1))
  const goToNext = () => setCurrentPage(p => Math.min(totalPages, p + 1))

  const renderPageNumbers = () => {
    const pages = []
    pages.push(
      <button key={1} onClick={() => setCurrentPage(1)} className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs sm:text-sm ${currentPage === 1 ? "bg-blue-100 text-general-20 font-bold" : "hover:bg-general-30 text-general-80"}`}>1</button>
    )
    if (currentPage > 3) pages.push(<span key="dots-start" className="px-1 text-general-60">...</span>)
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)
    for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)} className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs sm:text-sm ${currentPage === i ? "bg-blue-100 text-general-20 font-bold" : "hover:bg-general-30 text-general-80"}`}>{i}</button>
        )
    }
    if (currentPage < totalPages - 2) pages.push(<span key="dots-end" className="px-1 text-general-60">...</span>)
    if (totalPages > 1) {
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 flex items-center justify-center rounded transition-colors text-xs sm:text-sm ${currentPage === totalPages ? "bg-blue-100 text-general-20 font-bold" : "hover:bg-general-30 text-general-80"}`}>{totalPages}</button>
      )
    }
    return pages
  }

  return (
    <DashboardAnggotaLayout>
      <div className="p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="h4 text-general-100">Laporan Lama (History)</h1>
        </div>

        {/* Filter Section */}
        <FilterSection onFilter={(newFilters) => setActiveFilters(newFilters)} />

        {/* Table Section */}
        <div className="bg-general-20 border border-general-30 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-general-20 border-b border-general-30 text-general-100 body-sm font-heading font-bold">
                  <th className="p-4 w-16 text-center border-r border-general-30">No</th>
                  <th className="p-4 w-28 text-center border-r border-general-30">Tanggal</th>
                  <th className="p-4 border-r border-general-30 min-w-[200px]">Lokasi</th> 
                  <th className="p-4 border-r border-general-30">Kategori</th>
                  
                  {/* Kolom Tingkat Masalah */}
                  <th className="p-4 w-40 text-center border-r border-general-30">Tingkat Masalah</th>
                  
                  <th className="p-4 w-32 text-center border-r border-general-30">Status</th>
                  <th className="p-4 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                    <tr key={item.id} className="border-b border-general-30 hover:bg-general-30/20 transition-colors">
                        <td className="p-4 text-center text-general-100 body-sm border-r border-general-30">{item.id}</td>
                        <td className="p-4 text-center text-general-100 body-sm border-r border-general-30">{item.displayDate}</td>
                        <td className="p-4 text-general-100 body-sm border-r border-general-30">
                          <span className="font-medium text-blue-100">{item.district}</span>, {item.city}, <span className="text-general-60">{item.province}</span>
                        </td>
                        <td className="p-4 text-general-100 body-sm border-r border-general-30">{item.category}</td>
                        
                        {/* BADGE: Tingkat Masalah */}
                        <td className="p-4 text-center border-r border-general-30">
                            <span className={`inline-block px-3 py-1 rounded text-general-20 text-xs font-bold w-full shadow-sm
                                ${item.riskLevel === 'Tinggi' ? 'bg-red-100' : ''}
                                ${item.riskLevel === 'Sedang' ? 'bg-[hsl(var(--warning))] text-white' : ''}
                                ${item.riskLevel === 'Rendah' ? 'bg-blue-100' : ''}
                            `}>
                                {item.riskLevel}
                            </span>
                        </td>

                        {/* BADGE: Status (Hanya Terverifikasi/Ditolak) */}
                        <td className="p-4 text-center border-r border-general-30">
                            <span className={`inline-block px-3 py-1 rounded text-general-20 text-xs font-bold w-full shadow-sm
                                ${item.variant === 'red' ? 'bg-red-100' : ''}
                                ${item.variant === 'green' ? 'bg-green-100' : ''}
                            `}>
                                {item.status}
                            </span>
                        </td>

                        {/* Action: Link ke Detail Laporan LAMA */}
                        <td className="p-4 text-center">
                            <Link 
                                to="/dashboard/laporan-lama/$id" 
                                params={{ id: item.id.toString() }}
                                className="text-blue-100 hover:text-blue-90 hover:underline body-sm font-medium"
                            >
                                Lihat Detail
                            </Link>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-general-60 body-sm">Tidak ada data yang sesuai dengan filter.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-general-30 text-general-60 body-sm">
                <span className="text-xs sm:text-sm">Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data</span>
                <div className="flex items-center gap-1">
                  <button onClick={goToFirst} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsLeft className="w-4 h-4" /></button>
                  <button onClick={goToPrev} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <div className="flex gap-1 mx-2">{renderPageNumbers()}</div>
                  <button onClick={goToNext} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  <button onClick={goToLast} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsRight className="w-4 h-4" /></button>
                </div>
            </div>
          )}
        </div>
      </div>
    </DashboardAnggotaLayout>
  )
}


// --- 4. COMPONENT: FILTER SECTION ---
interface FilterSectionProps {
  onFilter: (filters: FilterValues) => void
}

function FilterSection({ onFilter }: FilterSectionProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>({
    startDate: "",
    endDate: "",
    province: "",
    city: "",
    district: "",
    category: ""
  })
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]
  const minDate = "2024-01-01"

  const provinces = [...new Set(allDataLaporan.map(i => i.province))]
  const categories = [...new Set(allDataLaporan.map(i => i.category))]
  const cities = useMemo(() => {
    return [...new Set(allDataLaporan
      .filter(item => !localFilters.province || item.province === localFilters.province)
      .map(item => item.city))]
  }, [localFilters.province])
  const districts = useMemo(() => {
    return [...new Set(allDataLaporan
      .filter(item => !localFilters.city || item.city === localFilters.city)
      .map(item => item.district))]
  }, [localFilters.city])

  const handleChange = (key: keyof FilterValues, value: string) => {
    setLocalFilters(prev => {
        if (key === 'province') return { ...prev, [key]: value, city: "", district: "" }
        if (key === 'city') return { ...prev, [key]: value, district: "" }
        return { ...prev, [key]: value }
    })
  }

  const handleDateInput = (key: 'startDate' | 'endDate', val: string) => {
    if (val) {
      const year = val.split("-")[0]
      if (year.length > 4) return 
    }
    setLocalFilters(prev => ({ ...prev, [key]: val }))
    if (error) setError("") 
  }

  const handleSearch = () => {
    if (localFilters.startDate && localFilters.endDate && localFilters.startDate > localFilters.endDate) {
      setError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.")
      return
    }
    if ((localFilters.startDate && localFilters.startDate > today) || (localFilters.endDate && localFilters.endDate > today)) {
        setError("Tanggal tidak boleh melebihi hari ini.")
        return
    }
    setError("")
    onFilter(localFilters)
  }

  const handleReset = () => {
      const empty = { startDate: "", endDate: "", province: "", city: "", district: "", category: "" }
      setLocalFilters(empty)
      setError("")
      onFilter(empty)
  }

  const isDateError = error !== ""

  return (
    <div className="bg-general-20 rounded-lg p-4 md:p-6 shadow-md border border-general-30 mb-6">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="h5 text-general-100">Filter Laporan</h2>
        <div className="flex gap-4 items-center">
            {error && (
                <div className="flex items-center gap-2 text-red-100 text-xs bg-red-20 px-3 py-1 rounded-full animate-pulse border border-red-100/20 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
            {Object.values(localFilters).some(v => v !== "") && (
                 <button onClick={handleReset} className="flex items-center gap-1 text-red-100 hover:text-red-90 text-xs font-medium transition-colors">
                    <XCircle className="w-3 h-3" /> Reset
                 </button>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Inputs */}
        <div>
          <label className="block body-sm font-medium text-general-80 mb-1.5">Mulai</label>
          <input
            type="date"
            value={localFilters.startDate}
            min={minDate}
            max={today}
            onChange={(e) => handleDateInput('startDate', e.target.value)}
            className={`w-full px-3 py-2 bg-general-20 border rounded-lg focus:ring-2 body-sm transition-colors ${isDateError ? "border-red-100 focus:ring-red-100 text-red-100" : "border-general-30 focus:ring-blue-100 focus:border-blue-100"}`}
          />
        </div>
        <div>
          <label className="block body-sm font-medium text-general-80 mb-1.5">Akhir</label>
          <input
            type="date"
            value={localFilters.endDate}
            min={localFilters.startDate || minDate}
            max={today}
            onChange={(e) => handleDateInput('endDate', e.target.value)}
            className={`w-full px-3 py-2 bg-general-20 border rounded-lg focus:ring-2 body-sm transition-colors ${isDateError ? "border-red-100 focus:ring-red-100 text-red-100" : "border-general-30 focus:ring-blue-100 focus:border-blue-100"}`}
          />
        </div>
        <div>
          <label className="block body-sm font-medium text-general-80 mb-1.5">Provinsi</label>
          <div className="relative">
            <select
              value={localFilters.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className="w-full px-3 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-100 text-general-100 body-sm appearance-none cursor-pointer truncate"
            >
              <option value="">Semua</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-general-40 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block body-sm font-medium text-general-80 mb-1.5">Kota/Kab</label>
          <div className="relative">
            <select
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={!localFilters.province}
              className="w-full px-3 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-100 text-general-100 body-sm appearance-none cursor-pointer disabled:bg-general-30/20 disabled:text-general-50 truncate"
            >
              <option value="">Semua</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-general-40 pointer-events-none" />
          </div>
        </div>
        <div className="lg:col-span-2">
          <label className="block body-sm font-medium text-general-80 mb-1.5">Kategori</label>
          <div className="relative">
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-100 text-general-100 body-sm appearance-none cursor-pointer truncate"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-general-40 pointer-events-none" />
          </div>
        </div>
        <div className="lg:col-span-6 flex justify-end mt-2">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-2 bg-blue-100 hover:bg-blue-90 text-general-20 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 body-sm font-heading shadow-sm active:scale-95"
          >
            <Search className="w-4 h-4" />
            Cari Data
          </button>
        </div>
      </div>
    </div>
  )
}