import { createFileRoute, Link } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ReportForm } from "@/components/report/report-form"
import { useSEO } from "@/hooks/use-seo"
import { SEO } from "@/config/seo"
import { LogIn } from "lucide-react"

export const Route = createFileRoute("/lapor/")({
  component: LaporPage,
})

function LaporPage() {
  useSEO(SEO.lapor)
  const isLoggedIn = !!localStorage.getItem("public_token")

  return (
    <div className="min-h-screen flex flex-col bg-general-20 font-sans">
      <Navbar />

      <main className="flex-1 pt-8 md:pt-12 pb-16 md:pb-24">

        {/* Main container */}
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

          {/* Form or auth guard */}
          <div className="w-full">
            {isLoggedIn ? (
              <ReportForm />
            ) : (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-general-30 p-8 text-center">
                <div className="w-14 h-14 bg-blue-20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <LogIn className="w-7 h-7 text-blue-100" />
                </div>
                <h2 className="font-heading text-lg font-bold text-general-100 mb-2">
                  Masuk Terlebih Dahulu
                </h2>
                <p className="body-sm text-general-60 mb-6">
                  Anda harus masuk terlebih dahulu untuk membuat laporan.
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-100 to-blue-90 hover:from-blue-90 hover:to-blue-100 text-white font-heading font-bold rounded-xl transition-all shadow-lg shadow-blue-100/20 hover:shadow-blue-100/40 body-sm"
                >
                  Masuk
                </Link>
                <p className="body-xs text-general-50 mt-4">
                  Belum punya akun?{" "}
                  <Link to="/auth/register" className="text-blue-100 font-semibold hover:underline">
                    Daftar di sini
                  </Link>
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}