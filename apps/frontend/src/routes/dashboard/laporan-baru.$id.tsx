import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  User,
  AlertCircle,
  X 
} from "lucide-react"
import { useState, useEffect } from "react"

export const Route = createFileRoute("/dashboard/laporan-baru/$id")({
  component: LaporanDetail,
})

// --- DATA DUMMY (4 Foto untuk simulasi List) ---
const mockDatabase = {
  "1": {
    id: 1,
    reporterName: "Abdul Wahid",
    reporterEmail: "abdulw@gmail.com",
    locationDetail: "Dapur SPPG Contoh 01",
    chronology: "Di dapur sppg contoh 01 terjadi pelanggaran kebersihan dalam membuat makanan MBG untuk SD. Petugas tidak menggunakan sarung tangan.",
    relation: "Pekerja Dapur",
    evidence: [
      { name: "foto_nasi_basi.jpg", url: "https://placehold.co/600x400/png?text=Nasi+Basi" },
      { name: "kondisi_dapur.png", url: "https://placehold.co/600x400/png?text=Kondisi+Dapur" },
      { name: "petugas_tanpa_masker.jpg", url: "https://placehold.co/600x400/png?text=Petugas+No+Masker" },
      { name: "sampah_menumpuk.jpg", url: "https://placehold.co/600x400/png?text=Sampah+Dapur" }
    ],
    date: "01/01/2026",
    status: "Pending"
  },
  "default": {
    id: 99,
    reporterName: "Anonim",
    reporterEmail: "pelapor@contoh.com",
    locationDetail: "SD Negeri 05 Pagi",
    chronology: "Makanan yang dibagikan terindikasi basi.",
    relation: "Orang Tua Murid",
    evidence: [
        { name: "bukti_fisik.jpg", url: "https://placehold.co/600x400/png?text=Bukti+Fisik" }
    ],
    date: "01/01/2026",
    status: "Pending"
  }
}

function LaporanDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const record = mockDatabase[id as keyof typeof mockDatabase] || mockDatabase["default"]
    setData(record)
  }, [id])

  const handleAction = async (action: 'verify' | 'reject') => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log(`Laporan ${id} telah di-${action}`)
    setIsProcessing(false)
    navigate({ to: "/dashboard/laporan-lama" })
  }

  const handleViewEvidence = (url: string) => {
    setSelectedImage(url)
  }

  if (!data) return <div className="p-8 body-sm text-general-60">Loading data...</div>

  return (
    <DashboardAnggotaLayout>
      <div className="p-8 max-w-4xl mx-auto font-sans relative">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/dashboard/laporan-baru" 
            className="p-2 rounded-full hover:bg-general-30 text-general-60 hover:text-general-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="h4 text-general-100">Detail Laporan</h1>
            <p className="body-sm text-general-60">ID Laporan: #{id}</p>
          </div>
        </div>

        {/* --- CARD UTAMA --- */}
        <div className="bg-general-20 border border-general-30 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-green-100/10"></div>

            <div className="mb-6 pb-6 border-b border-general-30">
                <h2 className="h5 font-heading text-general-100 mb-1">
                    Detail Laporan
                </h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Detail Lokasi</label>
                    <div className="w-full px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg text-general-80 body-sm font-medium">
                        {data.locationDetail}
                    </div>
                </div>

                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Kronologi Kejadian</label>
                    <div className="w-full px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg text-general-80 body-sm leading-relaxed min-h-[100px]">
                        {data.chronology}
                    </div>
                </div>

                {/* --- BAGIAN BUKTI (LIST STYLE) --- */}
                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">
                        Bukti Foto
                    </label>
                    <div className="space-y-3">
                        {data.evidence.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg group hover:border-green-40 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-general-20 rounded-md text-general-60 border border-general-30 shrink-0">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <span className="body-sm font-medium text-general-80 truncate">
                                        {file.name}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleViewEvidence(file.url)}
                                    className="text-xs font-bold text-blue-100 hover:text-blue-90 hover:underline px-3 shrink-0 transition-colors"
                                >
                                    Lihat
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Relasi dengan MBG</label>
                    <div className="w-full px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg text-general-80 body-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-general-60" />
                        {data.relation}
                    </div>
                </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="mt-10 pt-6 border-t border-general-30 flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button 
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-red-100 hover:bg-red-90 text-general-20 font-heading font-semibold rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 body-sm"
                >
                    {isProcessing ? "Memproses..." : <><XCircle className="w-5 h-5" /> Tolak Laporan</>}
                </button>

                <button 
                    onClick={() => handleAction('verify')}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-green-100 hover:bg-green-90 text-general-20 font-heading font-semibold rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 body-sm"
                >
                    {isProcessing ? "Memproses..." : <><CheckCircle className="w-5 h-5" /> Verifikasi</>}
                </button>
            </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-20 border border-blue-30 rounded-lg text-blue-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="body-sm">
                <p className="font-bold mb-1">Catatan Verifikator:</p>
                <p>Pastikan bukti foto valid dan kronologi masuk akal sebelum memverifikasi laporan.</p>
            </div>
        </div>

      </div>

      {/* --- MODAL POPUP IMAGE --- */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={() => setSelectedImage(null)}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 p-3 bg-general-100/50 hover:bg-general-100 text-general-20 rounded-full transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>
                <img 
                    src={selectedImage} 
                    alt="Bukti Laporan Full" 
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        </div>
      )}

    </DashboardAnggotaLayout>
  )
}