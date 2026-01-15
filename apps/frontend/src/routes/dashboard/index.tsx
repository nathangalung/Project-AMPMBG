import { createFileRoute } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardAnggota,
})

function DashboardAnggota() {
  // Tidak perlu lagi ada state user/logout di sini, 
  // karena sudah ditangani oleh DashboardAnggotaLayout

  return (
    <DashboardAnggotaLayout>
      <div className="p-8">
        
        {/* --- Header Section --- */}
        {/* Menggunakan Green-20 untuk background soft & Green-40 untuk border */}
        <div className="bg-green-20 border border-green-40 rounded-xl p-6 mb-8">
          <h1 className="h4 text-general-100 mb-2">
            Data dan Statistik Laporan MBG
          </h1>
          <p className="body-sm text-general-80 leading-relaxed">
            Data di bawah ini di ambil dari laporan yang tersimpan di server Asosiasi 
            Masyarakat Pelaku MBG (AMP MBG). Angka-angka ini membantu memotret 
            pola masalah dan wilayah prioritas terhadap program Makan Bergizi Gratis (MBG).
          </p>
        </div>

        {/* --- Stats Grid - Row 1 (Colored Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Card Biru */}
          <div className="bg-blue-20 border border-blue-30 rounded-xl p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
            <h3 className="body-sm font-heading font-bold text-blue-100">Total Laporan Masuk</h3>
            <p className="h3 text-blue-100">0</p>
          </div>

          {/* Card Warning */}
          <div className="bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.3)] rounded-xl p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
            <h3 className="body-sm font-heading font-bold text-[hsl(var(--warning))]">Perlu Diverifikasi</h3>
            <p className="h3 text-[hsl(var(--warning))]">0</p>
          </div>

          {/* Card Hijau */}
          <div className="bg-green-20 border border-green-30 rounded-xl p-5 shadow-sm min-h-[120px] flex flex-col justify-between">
            <h3 className="body-sm font-heading font-bold text-green-100">Diverifikasi</h3>
            <p className="h3 text-green-100">0</p>
          </div>

        </div>

        {/* --- Stats Grid - Row 2 (White Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          <div className="bg-general-20 border border-general-30 rounded-xl p-5 shadow-sm min-h-[140px]">
            <h3 className="body-xs font-heading font-bold text-general-60 uppercase mb-4">Kabupaten/Kota yang Terlapor</h3>
            <p className="h3 text-general-100">0</p>
          </div>

          <div className="bg-general-20 border border-general-30 rounded-xl p-5 shadow-sm min-h-[140px]">
            <h3 className="body-xs font-heading font-bold text-general-60 uppercase mb-4">Laporan Berisiko Tinggi</h3>
            <p className="h3 text-general-100">0</p>
          </div>

          <div className="bg-general-20 border border-general-30 rounded-xl p-5 shadow-sm min-h-[140px]">
            <h3 className="body-xs font-heading font-bold text-general-60 uppercase mb-2">Kategori Masalah Terbanyak</h3>
            <p className="h5 text-general-100 leading-tight">
              Keracunan dan<br/>Masalah<br/>Kesehatan
            </p>
          </div>

        </div>

        {/* --- Chart Placeholder --- */}
        <div className="bg-general-20 border border-general-30 rounded-xl p-6 shadow-sm min-h-[300px]">
          <h3 className="h6 text-general-100 mb-4">Tren Laporan Bulanan</h3>
          <div className="w-full h-48 bg-general-20 border-2 border-dashed border-general-30 rounded-lg flex items-center justify-center text-general-40 body-sm">
            Grafik akan muncul di sini
          </div>
        </div>

      </div>
    </DashboardAnggotaLayout>
  )
}