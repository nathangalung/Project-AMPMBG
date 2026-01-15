import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  User,
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"

export const Route = createFileRoute("/dashboard/laporan-lama/$id")({
  component: LaporanLamaDetail,
})

// --- MOCK DATABASE (Detail Statis) ---
const mockStaticDetails = {
  reporterName: "Abdul Wahid",
  reporterEmail: "abdulw@gmail.com",
  locationDetail: "Dapur SPPG Contoh 01",
  chronology: "Di dapur sppg contoh 01 terjadi pelanggaran kebersihan dalam membuat makanan MBG untuk SD.",
  relation: "Pekerja Dapur",
  evidence: [
    { name: "foto_nasi_basi.jpg", url: "https://placehold.co/600x400/png?text=Bukti+Nasi" },
    { name: "kondisi_dapur.jpg", url: "https://placehold.co/600x400/png?text=Dapur" }
  ]
}

function LaporanLamaDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState<any>(null)
  
  // Form State
  const [riskLevel, setRiskLevel] = useState("")
  const [status, setStatus] = useState("")
  
  // UI State
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // 1. Load Data
  useEffect(() => {
    const storedData = localStorage.getItem("AMP_MBG_LAPORAN_LAMA")
    if (storedData) {
      const allReports = JSON.parse(storedData)
      const foundReport = allReports.find((r: any) => r.id.toString() === id)
      
      if (foundReport) {
        setData({ ...foundReport, ...mockStaticDetails })
        setRiskLevel(foundReport.riskLevel)
        setStatus(foundReport.status)
      }
    }
  }, [id])

  // 2. Handler Simpan
  const handleSaveChanges = async () => {
    setIsSaving(true)
    
    // Simulasi Loading
    await new Promise(resolve => setTimeout(resolve, 800))

    // Update LocalStorage
    const storedData = localStorage.getItem("AMP_MBG_LAPORAN_LAMA")
    if (storedData) {
        const allReports = JSON.parse(storedData)
        const updatedReports = allReports.map((report: any) => {
            if (report.id.toString() === id) {
                return { 
                    ...report, 
                    riskLevel: riskLevel, 
                    status: status,       
                    variant: status === "Ditolak" ? "red" : "green" 
                }
            }
            return report
        })
        
        localStorage.setItem("AMP_MBG_LAPORAN_LAMA", JSON.stringify(updatedReports))
    }

    setIsSaving(false)
    setShowSuccessModal(true) // Tampilkan Modal Sukses
  }

  // Handler Tutup Modal & Redirect
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    navigate({ to: "/dashboard/laporan-lama" })
  }

  const handleViewEvidence = (url: string) => setSelectedImage(url)

  if (!data) return <div className="p-8 body-sm text-general-60">Memuat data ID: {id}...</div>

  return (
    <DashboardAnggotaLayout>
      <div className="p-8 max-w-4xl mx-auto font-sans relative">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/dashboard/laporan-lama" 
            className="p-2 rounded-full hover:bg-general-30 text-general-60 hover:text-general-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="h4 text-general-100">Detail Laporan Lama</h1>
            <p className="body-sm text-general-60">ID Laporan: #{id}</p>
          </div>
        </div>

        {/* Card Utama */}
        <div className="bg-general-20 border border-general-30 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-100/20"></div>
            <div className="mb-6 pb-6 border-b border-general-30">
                <h2 className="h5 font-heading text-general-100 mb-1">
                    Detail <span className="font-normal text-general-60 body-sm ml-1">(Laporan oleh akun <span className="text-blue-100 font-medium underline">{data.reporterEmail}</span>)</span>
                </h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Detail Lokasi</label>
                    <div className="w-full px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg text-general-80 body-sm font-medium">{data.locationDetail}</div>
                </div>
                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Kronologi Kejadian</label>
                    <div className="w-full px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg text-general-80 body-sm leading-relaxed min-h-[100px]">{data.chronology}</div>
                </div>
                <div>
                    <label className="block body-sm font-heading font-bold text-general-100 mb-2">Bukti (Foto)</label>
                    <div className="space-y-3">
                        {data.evidence.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between px-4 py-3 bg-general-30/50 border border-general-30 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-general-20 rounded-md text-general-60 border border-general-30">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <span className="body-sm font-medium text-general-80 truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                </div>
                                <button onClick={() => handleViewEvidence(file.url)} className="text-xs font-bold text-blue-100 hover:underline px-3">Lihat</button>
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

                {/* Edit Form */}
                <div className="pt-6 border-t border-general-30 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block body-sm font-heading font-bold text-general-100 mb-2">Kategori / Tingkat Masalah</label>
                        <div className="relative">
                            <select
                                value={riskLevel}
                                onChange={(e) => setRiskLevel(e.target.value)}
                                className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 body-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-green-100 focus:border-green-100"
                            >
                                <option value="Tinggi">Tingkat Tinggi</option>
                                <option value="Sedang">Tingkat Sedang</option>
                                <option value="Rendah">Tingkat Rendah</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-general-60 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block body-sm font-heading font-bold text-general-100 mb-2">Status Laporan</label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`w-full px-4 py-3 border border-general-30 rounded-lg body-sm font-medium appearance-none cursor-pointer focus:ring-2 
                                    ${status === 'Ditolak' ? 'bg-red-20 text-red-100 focus:ring-red-100' : 'bg-green-20 text-green-100 focus:ring-green-100'}`}
                            >
                                <option value="Terverifikasi">Terverifikasi</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-general-60 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center pt-6 border-t border-general-30">
                <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-8 py-3 bg-red-100 hover:bg-red-90 text-general-20 font-heading font-semibold rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
      </div>

      {/* --- MODAL SUCCESS (New Design) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-general-20 rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 border border-general-30 text-center">
            
            <div className="w-16 h-16 bg-green-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-100" />
            </div>
            
            <h3 className="h5 text-general-100 mb-2">Berhasil Disimpan!</h3>
            <p className="body-sm text-general-60 mb-6">
              Perubahan status dan kategori laporan telah berhasil diperbarui di sistem.
            </p>
            
            <button
              onClick={handleCloseSuccessModal}
              className="w-full py-3 bg-green-100 hover:bg-green-90 text-general-20 font-heading font-medium rounded-lg transition-colors shadow-sm"
            >
              Kembali ke Daftar Laporan
            </button>
          </div>
        </div>
      )}

      {/* Modal Image Viewer */}
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
                <img src={selectedImage} alt="Bukti Full" className="max-w-full max-h-full object-contain rounded-md shadow-2xl" onClick={(e) => e.stopPropagation()} />
            </div>
        </div>
      )}
    </DashboardAnggotaLayout>
  )
}