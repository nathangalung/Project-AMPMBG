import { createFileRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ReportForm } from "@/components/report/report-form"

export const Route = createFileRoute("/lapor/")({
  component: LaporPage,
})

function LaporPage() {
  return (
    <div className="min-h-screen flex flex-col bg-general-20 font-sans">
      <Navbar />
      
      <main className="flex-1 pt-8 md:pt-12 pb-16 md:pb-24">
        
        {/* CONTAINER UTAMA:
            - Dihapus: max-w-screen-2xl (Penyebab mengecil saat zoom out).
            - Diganti: w-full (Agar selalu 100% lebar layar).
            - Tetap: px-5 ... px-24 (Agar konten tidak nempel tembok, tapi tetap luas).
        */}
        <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
          
          {/* Header Section */}
          <div className="text-center mb-10 md:mb-14 max-w-4xl mx-auto">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-general-100 mb-4">
              Formulir Pelaporan <span className="text-blue-100">MBG</span>
            </h1>
            <p className="body-md text-general-60 leading-relaxed">
              Temukan ketidaksesuaian dalam pelaksanaan Makan Bergizi Gratis? 
              Laporkan kepada kami untuk tindak lanjut segera.
            </p>
          </div>

          {/* Form Container: Full width mengikuti parent */}
          <div className="w-full">
            <ReportForm />
          </div>
          
        </div>
      </main>
      <Footer />
    </div>
  )
}