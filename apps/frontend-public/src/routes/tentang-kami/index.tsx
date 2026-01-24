import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Users, ArrowUp, RefreshCw, Scale, Goal, Target } from "lucide-react"

export const Route = createFileRoute("/tentang-kami/")({
  component: TentangKamiPage,
})

const coreValues = [
  {
    icon: Users,
    title: "Kolaborasi",
    description: "Membangun kemitraan yang kuat antara masyarakat, pemerintah, dan pemangku kepentingan.",
  },
  {
    icon: RefreshCw,
    title: "Keberlanjutan",
    description: "Memastikan program berjalan efektif dan berkelanjutan untuk generasi mendatang.",
  },
  {
    icon: ArrowUp,
    title: "Advokasi",
    description: "Memperjuangkan hak-hak masyarakat untuk mendapatkan makanan bergizi berkualitas.",
  },
  {
    icon: Scale,
    title: "Keadilan",
    description: "Menjamin distribusi yang merata dan adil di seluruh wilayah Indonesia.",
  },
]

function TentangKamiPage() {
  const navigate = useNavigate()

  // Handler untuk tombol "Mulai Melapor"
  const handleLaporClick = () => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      navigate({ to: "/lapor" })
    } else {
      navigate({ to: "/auth/login" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-general-20">
      <Navbar />
      <main className="flex-1">
        
        {/* --- SECTION 1: HERO DENGAN FOTO (Sesuai Request Terakhir) --- */}
        <section className="relative bg-blue-100 min-h-[500px] flex items-center overflow-hidden">
          
          {/* Container Gambar (Kanan) */}
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-[55%] lg:w-[65%] hidden md:block lg:translate-x-12 transform transition-transform">
            <img
              src="/tentang_kami.webp"
              alt="Tim AMP MBG"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay 1: Memberi tint biru pada foto agar menyatu */}
            <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply" />
            {/* Overlay 2: Gradien dari kiri (solid biru) ke kanan (transparan) untuk transisi halus */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-100/80 to-transparent" />
          </div>

          {/* Container Konten (Kiri) */}
          <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 relative z-10">
            {/* Lebar konten dibatasi di desktop agar tidak menutupi foto terlalu banyak */}
            <div className="md:w-1/2 lg:w-[45%] py-16 md:py-24 text-white text-center md:text-left">
              
              <h1 className="h1 font-heading font-bold mb-6 leading-tight">
                Tentang <br />
                <span className="text-orange-20">AMP MBG</span>
              </h1>
              
              <p className="body-lg text-blue-20/90 leading-relaxed text-justify md:text-left">
                Asosiasi Masyarakat Pelaku Makan Bergizi Gratis (AMP MBG) adalah platform independen yang didedikasikan untuk mengawal dan memastikan transparansi dalam pelaksanaan Program Makan Bergizi Gratis di Indonesia.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: VISI & MISI --- */}
        <section className="py-16 md:py-24 bg-general-20">
          <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
            
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              
              {/* KARTU VISI: Center Vertikal & Horizontal */}
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-blue-30/50 hover:border-blue-100 transition-all group h-full">
                <div className="flex flex-col h-full justify-center items-center text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="p-3 bg-blue-20 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <Goal className="w-6 h-6 text-blue-100 group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="h3 font-heading font-bold text-blue-100">Visi</h2>
                  </div>
                  <p className="body-md text-general-60 leading-relaxed text-justify max-w-md">
                    Mewujudkan Indonesia yang sehat dan cerdas melalui program makan bergizi yang transparan, akuntabel, dan berkualitas tinggi untuk seluruh anak bangsa.
                  </p>
                </div>
              </div>

              {/* KARTU MISI */}
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-orange-30/50 hover:border-orange-100 transition-all group h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-20 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <Target className="w-6 h-6 text-orange-100 group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="h3 font-heading font-bold text-orange-100">Misi</h2>
                  </div>
                  <ul className="space-y-5 body-sm text-general-60 flex-grow">
                    <li className="flex items-start gap-3 text-justify">
                      <span className="w-2 h-2 bg-orange-100 rounded-full mt-2 shrink-0 ring-2 ring-orange-20" />
                      <span>
                        <strong className="block text-general-100 mb-0.5 font-bold">Meningkatkan Kolaborasi</strong>
                        Membangun kerjasama dengan berbagai pemangku kepentingan untuk pengawasan yang efektif.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-justify">
                      <span className="w-2 h-2 bg-orange-100 rounded-full mt-2 shrink-0 ring-2 ring-orange-20" />
                      <span>
                        <strong className="block text-general-100 mb-0.5 font-bold">Meningkatkan Kapasitas</strong>
                        Memberdayakan masyarakat untuk berpartisipasi aktif dalam pengawasan program.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-justify">
                      <span className="w-2 h-2 bg-orange-100 rounded-full mt-2 shrink-0 ring-2 ring-orange-20" />
                      <span>
                        <strong className="block text-general-100 mb-0.5 font-bold">Advokasi dan Aspirasi</strong>
                        Menyuarakan temuan dan rekomendasi kepada pihak berwenang untuk perbaikan berkelanjutan.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- SECTION 3: NILAI INTI (Background Bersih) --- */}
        <section className="py-16 md:py-24 bg-blue-20/30 relative overflow-hidden">
          <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="h3 font-heading font-bold text-blue-100 mb-4">Nilai-Nilai Inti</h2>
              <p className="body-md text-general-60 max-w-2xl mx-auto leading-relaxed">
                Prinsip-prinsip yang menjadi landasan setiap langkah kami dalam mengawal program MBG.
              </p>
              <div className="w-20 h-1 bg-orange-100 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {coreValues.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-general-30 hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                    <value.icon className="w-8 h-8 text-blue-100 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="h5 font-heading font-bold text-general-100 mb-3 group-hover:text-blue-100 transition-colors">
                    {value.title}
                  </h3>
                  <p className="body-sm text-general-60 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: CALL TO ACTION --- */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 text-center">
            <h2 className="h3 font-heading font-bold text-blue-100 mb-6">Mari Berkontribusi!</h2>
            <p className="body-md text-general-60 mb-10 leading-relaxed max-w-2xl mx-auto">
              Anda bisa berperan sebagai <strong>Masyarakat</strong> untuk melaporkan temuan, atau bergabung sebagai <strong>Anggota Resmi</strong> (Organisasi/Vendor) untuk kolaborasi yang lebih erat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Tombol Lapor (Masyarakat) - Menggunakan Button onClick Logic */}
              <button
                onClick={handleLaporClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-orange-100 hover:bg-orange-90 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 body-sm font-heading cursor-pointer"
              >
                Mulai Melapor
              </button>

              {/* Tombol Daftar Anggota */}
              <Link
                to="/daftar-anggota"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-100 hover:bg-blue-90 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 body-sm font-heading"
              >
                Daftar Jadi Anggota
              </Link>

              {/* Tombol Cara Kerja */}
              <Link
                to="/cara-kerja"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-blue-100 text-blue-100 hover:bg-blue-20 font-bold rounded-xl transition-all body-sm font-heading"
              >
                Pelajari Cara Kerjanya
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}