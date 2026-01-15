import { createFileRoute } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"
import { Link } from "@tanstack/react-router"
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

export const Route = createFileRoute("/dashboard/laporan-baru/")({
  component: LaporanBaruPage,
})

// --- 1. DATA DUMMY ---
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

  return Array.from({ length: 55 }, (_, i) => { 
    const loc = locations[i % locations.length]
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const year = i < 15 ? "2026" : "2025"
    
    return {
      id: i + 1,
      date: `${year}-${month}-${day}`,
      displayDate: `${day}/${month}/${year}`,
      province: loc.prov,
      city: loc.city,
      district: loc.dist,
      category: categories[i % categories.length],
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
function LaporanBaruPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State Filter Aktif
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
    
    // Style tombol pagination
    const baseClass = "w-8 h-8 flex items-center justify-center rounded transition-colors body-sm font-medium"
    const activeClass = "bg-blue-100 text-general-20 font-bold shadow-sm" // Menggunakan blue (Primary)
    const inactiveClass = "hover:bg-general-30 text-general-80"

    pages.push(
      <button key={1} onClick={() => setCurrentPage(1)} className={`${baseClass} ${currentPage === 1 ? activeClass : inactiveClass}`}>1</button>
    )
    if (currentPage > 3) pages.push(<span key="dots-start" className="px-1 text-general-60">...</span>)
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)
    for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button key={i} onClick={() => setCurrentPage(i)} className={`${baseClass} ${currentPage === i ? activeClass : inactiveClass}`}>{i}</button>
        )
    }
    if (currentPage < totalPages - 2) pages.push(<span key="dots-end" className="px-1 text-general-60">...</span>)
    if (totalPages > 1) {
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`${baseClass} ${currentPage === totalPages ? activeClass : inactiveClass}`}>{totalPages}</button>
      )
    }
    return pages
  }

  return (
    <DashboardAnggotaLayout>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            {/* Menggunakan typography .h4 dari index.css */}
            <h1 className="h4 text-general-100">Laporan Baru</h1>
        </div>

        {/* --- FILTER SECTION --- */}
        <FilterSection onFilter={(newFilters) => setActiveFilters(newFilters)} />

        {/* --- TABLE SECTION --- */}
        <div className="bg-general-20 border border-general-30 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* Header Table menggunakan font-heading (Poppins) */}
                <tr className="bg-general-20 border-b border-general-30 text-general-100 body-sm font-heading font-semibold">
                  <th className="p-4 w-16 text-center border-r border-general-30">No</th>
                  <th className="p-4 w-32 text-center border-r border-general-30">Tanggal</th>
                  <th className="p-4 border-r border-general-30 min-w-[250px]">Lokasi</th> 
                  <th className="p-4 border-r border-general-30">Kategori</th>
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
                          {/* Highlight lokasi dengan blue (Primary) atau tetap bold General */}
                          <span className="font-medium text-blue-100">{item.district}</span>, {item.city}, <span className="text-general-60">{item.province}</span>
                        </td>
                        <td className="p-4 text-general-100 body-sm border-r border-general-30">{item.category}</td>
                        <td className="p-4 text-center">
                        <Link 
                            to="/dashboard/laporan-baru/$id" 
                            params={{ id: item.id.toString() }}
                            // Link tetap menggunakan Blue Scale (Info) untuk konvensi link
                            className="text-blue-100 hover:text-blue-90 hover:underline body-sm font-medium transition-colors"
                        >
                            Lihat Detail
                        </Link>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-general-60 body-sm">Tidak ada data yang sesuai dengan filter.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* --- PAGINATION CONTROLS --- */}
          {filteredData.length > 0 && (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-general-30 text-general-60 body-sm">
                <span className="text-xs sm:text-sm">Menampilkan <span className="font-medium text-general-100">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)}</span> dari {filteredData.length} data</span>
                <div className="flex items-center gap-1">
                  <button onClick={goToFirst} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-general-80"><ChevronsLeft className="w-4 h-4" /></button>
                  <button onClick={goToPrev} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-general-80"><ChevronLeft className="w-4 h-4" /></button>
                  
                  <div className="flex gap-1 mx-2">{renderPageNumbers()}</div>
                  
                  <button onClick={goToNext} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-general-80"><ChevronRight className="w-4 h-4" /></button>
                  <button onClick={goToLast} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded hover:bg-general-30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-general-80"><ChevronsRight className="w-4 h-4" /></button>
                </div>
            </div>
          )}
        </div>
      </div>
    </DashboardAnggotaLayout>
  )
}


// --- 4. COMPONENT: FILTER SECTION (Dengan Error Handling & Design System) ---
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

  // Options
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

  // --- LOGIKA VALIDASI ERROR ---
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

  // Style Class untuk Input agar konsisten
  // Menggunakan Focus Ring blue-100 (Primary)
  const inputClass = `w-full px-3 py-2 bg-general-20 border rounded-lg focus:outline-none focus:ring-2 body-sm transition-all duration-200
    ${isDateError 
      ? "border-red-100 focus:ring-red-50 text-red-100" 
      : "border-general-30 focus:border-blue-100 focus:ring-blue-100/20 text-general-100"}`

  const labelClass = "block body-sm font-medium text-general-80 mb-1.5"

  return (
    <div className="bg-general-20 rounded-xl p-4 md:p-6 shadow-sm border border-general-30 mb-6">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
        {/* Menggunakan typography .h5 */}
        <h2 className="h5 text-general-100">Filter Laporan</h2>
        <div className="flex gap-4 items-center flex-wrap">
            {/* ALERT ERROR */}
            {error && (
                <div className="flex items-center gap-2 text-red-100 text-xs bg-red-20 px-3 py-1.5 rounded-full border border-red-30 font-medium animate-in fade-in slide-in-from-right-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </div>
            )}
            {Object.values(localFilters).some(v => v !== "") && (
                 <button onClick={handleReset} className="flex items-center gap-1 text-red-100 hover:text-red-90 text-xs font-medium transition-colors ml-auto sm:ml-0">
                    <XCircle className="w-3.5 h-3.5" /> Reset Filter
                 </button>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Start Date */}
        <div>
          <label className={labelClass}>Mulai</label>
          <input
            type="date"
            value={localFilters.startDate}
            min={minDate}
            max={today}
            onChange={(e) => handleDateInput('startDate', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* End Date */}
        <div>
          <label className={labelClass}>Akhir</label>
          <input
            type="date"
            value={localFilters.endDate}
            min={localFilters.startDate || minDate}
            max={today}
            onChange={(e) => handleDateInput('endDate', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Dropdowns */}
        <div>
          <label className={labelClass}>Provinsi</label>
          <div className="relative">
            <select
              value={localFilters.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer truncate pr-8`}
            >
              <option value="">Semua</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Kota/Kab</label>
          <div className="relative">
            <select
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={!localFilters.province}
              className={`${inputClass} appearance-none cursor-pointer truncate pr-8 disabled:bg-general-30/30 disabled:text-general-50 disabled:cursor-not-allowed`}
            >
              <option value="">Semua</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className={labelClass}>Kategori</label>
          <div className="relative">
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer truncate pr-8`}
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-6 flex justify-end mt-2">
          <button
            type="button"
            onClick={handleSearch}
            // Menggunakan blue-100 (Primary) untuk aksi utama
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-100 hover:bg-blue-90 text-general-20 rounded-lg transition-all flex items-center justify-center gap-2 body-sm font-heading font-medium shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            Cari Data
          </button>
        </div>
      </div>
    </div>
  )
}