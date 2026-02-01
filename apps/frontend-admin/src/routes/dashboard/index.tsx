import { createFileRoute, Link } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-admin-layout"
import { useQuery } from "@tanstack/react-query"
import { adminService } from "@/services/admin"
import {
  Loader2,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ChevronDown,
  FileText,
  ClipboardList,
  X,
  HelpCircle,
  ChevronUp,
  Lightbulb,
  ClipboardCheck
} from "lucide-react"
import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardAnggota,
})

const CATEGORY_LABELS: Record<string, string> = {
  poisoning: "Keracunan & Kesehatan",
  kitchen: "Operasional Dapur",
  quality: "Kualitas & Keamanan",
  policy: "Kebijakan & Anggaran",
  implementation: "Implementasi Program",
  social: "Dampak Sosial",
}

const MONTH_OPTIONS = [
  { value: 0, label: "Tahunan" },
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
]

// --- KONSTANTA MATRIKS ---
const RISK_LEGEND = [
  {
    label: "Tingkat Tinggi",
    className: "bg-red-20 text-red-100 border-red-30", 
    indicator: "bg-red-100", 
    desc: "Total Skor ≥ 12. Data sangat lengkap, valid, dan konsisten."
  },
  {
    label: "Tingkat Sedang",
    className: "bg-orange-40 text-orange-100 border-orange-40",
    indicator: "bg-orange-100",
    desc: "Total Skor 7 - 11. Data cukup jelas namun butuh verifikasi tambahan."
  },
  {
    label: "Tingkat Rendah",
    className: "bg-green-20 text-green-100 border-green-30",
    indicator: "bg-green-100",
    desc: "Total Skor ≤ 6. Informasi minim atau indikasi tidak valid."
  }
]

const SCORING_INDICATORS = [
  "Relasi Pelapor dengan MBG",
  "Validitas Lokasi & Waktu",
  "Kelengkapan Bukti Pendukung",
  "Konsistensi Narasi & Bahasa",
  "Riwayat Laporan Pelapor",
  "Kesesuaian dengan Laporan Lain"
]

function DashboardAnggota() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(0)
  const [showLegend, setShowLegend] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboard(),
  })

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin", "analytics", selectedYear, selectedMonth],
    queryFn: () => adminService.getAnalytics(selectedYear, selectedMonth),
  })

  const isLoading = statsLoading || analyticsLoading

  const riskCounts = {
    high: analytics?.overview.highRiskReports || 0,
    medium: analytics?.overview.mediumRiskReports || 0,
    low: analytics?.overview.lowRiskReports || 0,
  }

  const pendingCount = stats?.reports.pending || 0

  const topCategories = useMemo(() => {
    if (!stats?.reports.byCategory) return []
    return [...stats.reports.byCategory]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [stats])

  const chartData = useMemo(() => {
    if (analytics?.trends?.data) {
      return analytics.trends.data
    }
    return []
  }, [analytics])


  return (
    <DashboardAnggotaLayout>
      {/* FLUID CONTAINER:
          - w-full + max-w-[2400px]: Agar konten tidak pecah di layar ultrawide (zoom 50%).
          - px-4 sm:px-6 lg:px-8 xl:px-12: Padding bertahap agar rapi dari HP (33%) sampai Monitor Besar.
      */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 max-w-[2400px]">

        {/* --- Header Section --- */}
        {/* 'lg:flex-row' memastikan di laptop kecil/tablet landscape layout sudah side-by-side */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
            
            {/* Title Box */}
            <div className="flex-1 bg-general-20 border border-general-30 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h1 className="h4 text-general-100 mb-1">
                    Dashboard Monitoring
                </h1>
                <p className="body-sm text-general-60">
                    Pantau sebaran masalah program MBG secara real-time.
                </p>
                {/* flex-wrap: Mencegah tombol turun berantakan saat layar sempit/HP */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 bg-general-30/50 rounded-lg text-xs font-medium text-general-80 whitespace-nowrap">
                        Total Laporan: <span className="text-general-100 font-bold">{stats?.reports.total || 0}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-green-20 border border-green-30 rounded-lg text-xs font-medium text-green-100 whitespace-nowrap">
                        Terverifikasi: <span className="font-bold">{stats?.reports.total ? stats.reports.total - pendingCount : 0}</span>
                    </div>
                </div>
            </div>

            {/* Action Needed Card */}
            {/* lg:w-1/3 xl:w-1/4: Proporsi tetap di layar besar, w-full di HP */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-orange-800 text-xs font-bold uppercase tracking-wider mb-1">Perlu Tindakan</p>
                    <div className="flex items-baseline gap-2">
                        <span className="h1 text-orange-900 leading-none">{pendingCount}</span>
                        <span className="body-sm text-orange-800 font-medium">Laporan Baru</span>
                    </div>
                    <p className="text-xs text-orange-700/80 mt-2">Menunggu verifikasi admin</p>
                </div>
                <div className="h-16 w-16 bg-white/50 rounded-full flex items-center justify-center text-orange-500 shrink-0 ml-4">
                    <ClipboardList className="w-8 h-8" />
                </div>
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-blue-100 mb-4" />
            <p className="body-sm text-general-60">Memuat analitik data...</p>
          </div>
        ) : (
          <div className="space-y-6 xl:space-y-8">

            {/* --- SECTION 0: KETERANGAN MATRIKS --- */}
            <div>
                <div className="flex justify-end mb-4">
                    <button
                    onClick={() => setShowLegend(!showLegend)}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                        showLegend
                        ? "bg-blue-100 text-white border-blue-100 shadow-md"
                        : "bg-white text-general-60 border-general-30 hover:border-blue-30 hover:text-blue-100"
                    }`}
                    >
                    {showLegend ? <X className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                    <span>{showLegend ? "Tutup Keterangan" : "Lihat Matriks Penilaian Risiko"}</span>
                    {showLegend ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
                    </button>
                </div>

                <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showLegend ? 'max-h-[1200px] opacity-100 mb-6' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-30/50 shadow-sm">
                        {/* Grid: 1 kolom di HP, 2 kolom di Laptop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                            {/* KOLOM KIRI */}
                            <div className="flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-general-30">
                                <AlertTriangle className="w-4 h-4 text-blue-100" />
                                <h6 className="text-blue-100 uppercase tracking-wider font-heading font-bold text-xs">
                                Klasifikasi Kepercayaan Data
                                </h6>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {RISK_LEGEND.map((risk, idx) => (
                                <div key={idx} className={`p-3.5 rounded-xl border flex-1 flex flex-col justify-center ${risk.className}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${risk.indicator} ring-2 ring-white/20`} />
                                    <span className="font-heading font-bold text-sm leading-tight">{risk.label}</span>
                                    </div>
                                    <span className="text-xs font-medium opacity-90 leading-tight">{risk.desc}</span>
                                </div>
                                ))}
                            </div>
                            </div>

                            {/* KOLOM KANAN */}
                            <div className="flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-general-30">
                                <ClipboardCheck className="w-4 h-4 text-blue-100" />
                                <h6 className="text-blue-100 uppercase tracking-wider font-heading font-bold text-xs">
                                Komponen Matriks Penilaian
                                </h6>
                            </div>
                            <div className="bg-blue-20/50 border border-blue-30/50 rounded-xl p-3 mb-4 text-center">
                                <div className="flex justify-center mb-1"><Lightbulb className="w-4 h-4 text-blue-100" /></div>
                                <p className="text-xs text-blue-100 font-medium">Total skor dihitung dari penjumlahan poin 6 indikator (skala 0-3).</p>
                            </div>
                            {/* Grid indikator: Responsif 1 -> 2 kolom */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
                                {SCORING_INDICATORS.map((indicator, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-general-20/30 rounded-xl border border-general-30 shadow-sm hover:border-blue-30 transition-colors">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-white rounded text-xs font-bold shrink-0">{idx + 1}</span>
                                    <span className="text-xs font-medium text-general-100 leading-tight">{indicator}</span>
                                </div>
                                ))}
                            </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            
            {/* --- SECTION 1: RISIKO MASALAH --- */}
            {/* Responsif Grid: 1 (HP) -> 2 (Tablet) -> 3 (Laptop/Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
                <div className="bg-red-20 border border-red-30 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-red-100" /></div>
                    <p className="body-sm font-bold text-red-100 uppercase tracking-wider mb-1">Risiko Tinggi</p>
                    <p className="h2 text-red-100">{riskCounts.high}</p>
                </div>

                <div className="bg-orange-20 border border-orange-30 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-orange-400" /></div>
                    <p className="body-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Risiko Sedang</p>
                    <p className="h2 text-orange-400">{riskCounts.medium}</p>
                </div>

                {/* col-span-2 pada layar 'sm' (tablet) agar grid tidak bolong, kembali ke col-span-1 di 'lg' */}
                <div className="bg-green-20 border border-green-30 rounded-xl p-5 shadow-sm relative overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-green-100" /></div>
                    <p className="body-sm font-bold text-green-100 uppercase tracking-wider mb-1">Risiko Rendah</p>
                    <p className="h2 text-green-100">{riskCounts.low}</p>
                </div>
            </div>

            {/* --- SECTION 2: CHART & CATEGORIES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">

                {/* Left: Chart (2/3 width on Desktop) */}
                <div className="lg:col-span-2 bg-general-20 border border-general-30 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="h6 text-general-100 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-100" />
                            Tren Laporan
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="appearance-none bg-general-20 border border-general-30 text-general-80 py-1.5 pl-3 pr-8 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-100/20 focus:border-blue-100 outline-none cursor-pointer hover:bg-general-30/30 transition-colors"
                                >
                                    {[2024, 2025, 2026].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-general-60 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="appearance-none bg-general-20 border border-general-30 text-general-80 py-1.5 pl-3 pr-8 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-100/20 focus:border-blue-100 outline-none cursor-pointer hover:bg-general-30/30 transition-colors"
                                >
                                    {MONTH_OPTIONS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-general-60 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    {/* Responsive Height: h-64 (HP), lg:h-80 (Laptop), 2xl:h-96 (Ultrawide/Zoom Out) */}
                    <div className="h-64 lg:h-80 2xl:h-96 mt-4 transition-all duration-300">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    labelFormatter={(label) => selectedMonth === 0 ? `Bulan: ${label}` : `Tanggal: ${label}`}
                                    formatter={(value: number) => [`${value} Laporan`, "Jumlah"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, fill: "#3b82f6" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Top Categories */}
                <div className="bg-general-20 border border-general-30 rounded-xl p-6 shadow-sm flex flex-col">
                    <h3 className="h6 text-general-100 flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-blue-100" />
                        Masalah Terbanyak
                    </h3>
                    
                    <div className="flex-1 space-y-4">
                        {topCategories.map((cat, idx) => (
                            <div key={cat.category} className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-medium text-general-80">
                                        {CATEGORY_LABELS[cat.category] || cat.category}
                                    </span>
                                    <span className="text-xs font-bold text-general-100">{cat.count}</span>
                                </div>
                                <div className="w-full h-2 bg-general-30 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${idx === 0 ? 'bg-red-90' : idx === 1 ? 'bg-orange-400' : 'bg-blue-100'}`} 
                                        style={{ width: `${(cat.count / (stats?.reports.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {topCategories.length === 0 && (
                            <p className="text-xs text-general-60 text-center py-4">Belum ada data kategori.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: BREAKDOWN LOKASI --- */}
            <div>
                <h3 className="h6 text-general-100 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-general-60" />
                    Wilayah dengan Laporan Terbanyak
                </h3>
                
                {/* 1 Kolom (HP), 2 Kolom (Tablet), 3 Kolom (Laptop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
                    
                    <LocationCard 
                        title="Provinsi" 
                        data={analytics?.topProvinces?.slice(0, 5).map(i => ({ 
                            name: i.province, 
                            count: i.count 
                        })) || []} 
                    />
                    <LocationCard
                        title="Kabupaten/Kota"
                        data={analytics?.topCities?.slice(0, 5).map(i => ({
                            name: i.city,
                            sub: i.province,
                            count: i.count
                        })) || []}
                    />
                    <LocationCard
                        title="Kecamatan"
                        data={analytics?.topDistricts?.slice(0, 5).map(i => ({
                            name: i.district,
                            sub: i.city,
                            count: i.count
                        })) || []}
                    />

                </div>
            </div>

          </div>
        )}

      </div>
    </DashboardAnggotaLayout>
  )
}

// Reusable Location List Card
function LocationCard({ title, data }: { title: string, data: { name: string; sub?: string; count: number }[] }) {
    return (
        <div className="bg-general-20 border border-general-30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-general-30 bg-general-30/30">
                <h4 className="body-sm font-bold text-general-100">{title}</h4>
            </div>
            <div className="divide-y divide-general-30 flex-1">
                {data.length > 0 ? (
                    data.map((item, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center hover:bg-general-30/20 transition-colors">
                            {/* Tambahkan overflow-hidden agar teks panjang tidak merusak layout */}
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${idx < 3 ? 'bg-blue-100 text-general-20' : 'bg-general-30 text-general-60'}`}>
                                    {idx + 1}
                                </span>
                                {/* min-w-0 dan truncate sangat penting untuk responsifitas (layar 33%) */}
                                <div className="min-w-0 flex-1">
                                    <p className="body-sm text-general-80 truncate">{item.name}</p>
                                    {item.sub && <p className="text-[10px] text-general-50 truncate">{item.sub}</p>}
                                </div>
                            </div>
                            <span className="body-sm font-bold text-general-100 ml-2 shrink-0">{item.count}</span>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-general-60 body-sm">Belum ada data</div>
                )}
            </div>
            <div className="p-3 border-t border-general-30 text-center">
                <Link 
                    to="/dashboard/laporan" 
                    className="text-xs font-medium text-blue-100 hover:text-blue-90 hover:underline transition-colors"
                >
                    Lihat Semua {title}
                </Link>
            </div>
        </div>
    )
}