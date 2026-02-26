import { memo, useMemo, useState } from "react"
import {
  ClipboardCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Tag,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { reportsService } from "@/services/reports"
import { CATEGORY_LABELS_SHORT } from "@/hooks/use-categories"

const RISK_LEGEND = [
  {
    label: "Tingkat Tinggi",
    className: "bg-red-100 text-general-20 border-red-100", 
    indicator: "bg-general-20", 
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
    className: "bg-green-60 text-general-100 border-green-60",
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

function DataSummaryCardsComponent() {
  const [showLegend, setShowLegend] = useState(false)

  const { data: stats, isLoading } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => reportsService.getSummary(),
    staleTime: 30000,
  })

  const { row1Data, row2Data } = useMemo(() => {
    const topCategoryLabel = stats?.topCategory
      ? CATEGORY_LABELS_SHORT[stats.topCategory.category] || stats.topCategory.category
      : "-"

    const total = stats?.total || 0
    const verified = stats?.verified || 0
    const high = stats?.highRisk || 0
    const medium = stats?.mediumRisk || 0
    const low = stats?.lowRisk || 0

    const row1 = [
      {
        icon: ClipboardCheck,
        value: `${verified} / ${total}`,
        label: "Laporan Terverifikasi",
        desc: "Dari total laporan masuk",
        iconBg: "bg-blue-20",
        iconColor: "text-blue-100",
        borderColor: "hover:border-blue-30"
      },
      {
        icon: Tag,
        value: topCategoryLabel,
        label: "Kategori Terbanyak",
        desc: "Isu paling sering dilaporkan",
        iconBg: "bg-purple-20",
        iconColor: "text-purple-600",
        borderColor: "hover:border-purple-30"
      }
    ]

    const row2 = [
      {
        icon: AlertTriangle,
        value: high.toLocaleString(),
        label: "Tingkat Tinggi",
        iconBg: "bg-red-20",
        iconColor: "text-red-100",
        borderColor: "hover:border-red-30"
      },
      {
        icon: AlertCircle,
        value: medium.toLocaleString(),
        label: "Tingkat Sedang",
        iconBg: "bg-orange-20",
        iconColor: "text-orange-100",
        borderColor: "hover:border-orange-30"
      },
      {
        icon: Info,
        value: low.toLocaleString(),
        label: "Tingkat Rendah",
        iconBg: "bg-green-20",
        iconColor: "text-green-100",
        borderColor: "hover:border-green-30"
      }
    ]

    return { row1Data: row1, row2Data: row2 }
  }, [stats])

  const renderCard = (item: { icon: React.ElementType; value: string | number; label: string; desc?: string; iconBg: string; iconColor: string; borderColor: string }, index: number) => (
    <div
      key={index}
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 transition-all duration-300 border border-general-30 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${item.borderColor}`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} transition-transform group-hover:scale-105 duration-300`}>
          <item.icon className={`h-6 w-6 ${item.iconColor}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="h4 font-bold text-blue-100 leading-none mb-1">
            {isLoading ? "..." : item.value}
          </span>
          <span className="text-xs font-semibold text-general-80 truncate uppercase tracking-wide">
            {item.label}
          </span>
          {item.desc && (
            <span className="text-[10px] text-general-60 truncate mt-0.5">
              {item.desc}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mb-8">
      
      {/* Header and toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-blue-100">Ringkasan Statistik</h3>
          <p className="text-xs text-general-60 mt-0.5">Gambaran umum data laporan yang masuk.</p>
        </div>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
            showLegend
              ? "bg-blue-100 text-white border-blue-100 shadow-md"
              : "bg-white text-general-60 border-general-30 hover:border-blue-30 hover:text-blue-100"
          }`}
        >
          {showLegend ? <X className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
          <span>{showLegend ? "Tutup Keterangan" : "Lihat Matriks Penilaian"}</span>
          {showLegend ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
        </button>
      </div>

      {/* Legend panel */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showLegend ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl p-6 border border-blue-30/50 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* Left column */}
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-general-30">
                <AlertTriangle className="w-4 h-4 text-blue-100" />
                <h6 className="text-blue-100 uppercase tracking-wider font-heading font-bold text-xs">
                  Klasifikasi Kepercayaan
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

            {/* Right column */}
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {row1Data.map(renderCard)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {row2Data.map(renderCard)}
        </div>
      </div>
    </div>
  )
}

export const DataSummaryCards = memo(DataSummaryCardsComponent)