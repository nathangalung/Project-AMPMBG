import { ChevronDown, AlertCircle, Clock } from "lucide-react"
import type { ReportFormData } from "./report-form"

interface StepLocationCategoryProps {
  formData: ReportFormData
  updateFormData: (data: Partial<ReportFormData>) => void
}

// ... (DATA DUMMY WILAYAH TETAP SAMA) ...
const categories = [
  { value: "poisoning", label: "Keracunan dan Masalah Kesehatan" },
  { value: "kitchen", label: "Operasional Dapur" },
  { value: "quality", label: "Kualitas dan Keamanan Dapur" },
  { value: "policy", label: "Kebijakan dan Anggaran" },
  { value: "implementation", label: "Implementasi Program" },
  { value: "social", label: "Dampak Sosial dan Ekonomi" },
]

const provinces = [
  { value: "jakarta", label: "DKI Jakarta" },
  { value: "jabar", label: "Jawa Barat" },
  { value: "jatim", label: "Jawa Timur" },
]

const cities: Record<string, { value: string; label: string }[]> = {
  jakarta: [
    { value: "jaksel", label: "Jakarta Selatan" },
    { value: "jakbar", label: "Jakarta Barat" },
    { value: "jaktim", label: "Jakarta Timur" },
  ],
  jabar: [
    { value: "bandung", label: "Kota Bandung" },
    { value: "bogor", label: "Kab. Bogor" },
  ],
  jatim: [
    { value: "surabaya", label: "Kota Surabaya" },
    { value: "malang", label: "Kota Malang" },
  ],
}

const districts: Record<string, { value: string; label: string }[]> = {
  jaksel: [
    { value: "kebayoran_baru", label: "Kebayoran Baru" },
    { value: "kebayoran_lama", label: "Kebayoran Lama" },
    { value: "cilandak", label: "Cilandak" },
    { value: "pesanggrahan", label: "Pesanggrahan" },
    { value: "setiabudi", label: "Setiabudi" },
    { value: "tebet", label: "Tebet" },
  ],
  jakbar: [
    { value: "cengkareng", label: "Cengkareng" },
    { value: "grogol", label: "Grogol Petamburan" },
    { value: "kalideres", label: "Kalideres" },
  ],
  bandung: [
    { value: "cicendo", label: "Cicendo" },
    { value: "andir", label: "Andir" },
    { value: "sukajadi", label: "Sukajadi" },
  ],
  other: [],
}
// ... (AKHIR DATA DUMMY) ...

export function StepLocationCategory({ formData, updateFormData }: StepLocationCategoryProps) {
  const availableCities = formData.province ? cities[formData.province] || [] : []
  const availableDistricts = formData.city ? districts[formData.city] || [] : []

  // --- LOGIKA HITUNG KATA JUDUL (BARU) ---
  const maxTitleWords = 10
  
  // Hitung jumlah kata saat ini (split berdasarkan spasi, filter string kosong)
  const currentTitleWords = formData.title 
    ? formData.title.trim().split(/\s+/).filter(Boolean).length 
    : 0

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Hitung kata input baru
    const wordCount = inputValue.trim().split(/\s+/).filter(Boolean).length
    
    // Update HANYA JIKA jumlah kata <= 10 ATAU user sedang menghapus (backspace)
    if (wordCount <= maxTitleWords) {
      updateFormData({ title: inputValue })
    } else {
        // Edge case: mencegah ketikan kata ke-11, tapi tetap mengizinkan spasi di akhir kata ke-10
        // (Logic ini membiarkan input "masuk" hanya jika tidak menambah kata baru melebihi batas)
        const isTrailingSpace = inputValue.endsWith(" ")
        if (wordCount === maxTitleWords + 1 && !isTrailingSpace) {
            // Mencegah input kata ke-11
            return 
        }
        // Fallback update (biasanya tidak terpanggil jika logic di atas benar)
        updateFormData({ title: inputValue }) 
    }
  }

  // --- LOGIKA HITUNG KARAKTER LOKASI ---
  const maxLength = 100
  const currentLength = formData.location.length

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue.length <= maxLength) {
      updateFormData({ location: inputValue })
    }
  }

  // --- LOGIKA TANGGAL & WAKTU ---
  const today = new Date().toISOString().split("T")[0]
  const now = new Date()
  const currentTimeString = now.toTimeString().slice(0, 5)
  const minDate = "2024-01-01"

  const isDateFuture = formData.date > today
  const isDateTooOld = formData.date < minDate && formData.date !== ""
  const isYearInvalid = formData.date.split("-")[0].length > 4
  const isDateError = isDateFuture || isDateTooOld || isYearInvalid

  const isTimeFuture = formData.date === today && formData.time > currentTimeString
  const isTimeError = isTimeFuture

  return (
    <div className="space-y-6">
      
      {/* JUDUL LAPORAN (Maksimal 10 Kata) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="title" className="block body-sm font-medium text-general-80">
            Judul Laporan <span className="text-red-100">*</span>
          </label>
          <span className={`text-xs ${currentTitleWords === maxTitleWords ? 'text-red-100 font-bold' : 'text-general-60'}`}>
            {currentTitleWords}/{maxTitleWords} Kata
          </span>
        </div>
        
        <input
          type="text"
          id="title"
          value={formData.title || ""}
          onChange={handleTitleChange}
          placeholder="Contoh: Keracunan Makanan Siswa SD Harapan Bangsa"
          className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors placeholder:text-general-40 
            ${currentTitleWords > maxTitleWords // Visual cue jika somehow lewat (defensive)
              ? 'border-red-100 focus:ring-red-100 focus:border-red-100' 
              : 'border-general-30 focus:ring-green-100 focus:border-green-100'
            }`}
        />
        {currentTitleWords >= maxTitleWords && (
           <p className="text-xs text-general-50 mt-1">Maksimal 10 kata.</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block body-sm font-medium text-general-80 mb-2">
          Kategori Laporan <span className="text-red-100">*</span>
        </label>
        <div className="relative">
          <select
            id="category"
            value={formData.category}
            onChange={(e) => updateFormData({ category: e.target.value })}
            className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Pilih kategori laporan</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid Tanggal & Waktu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <label htmlFor="date" className="block body-sm font-medium text-general-80 mb-2">
            Tanggal Kejadian <span className="text-red-100">*</span>
            </label>
            <div className="relative">
            <input
                type="date"
                id="date"
                lang="id-ID"
                value={formData.date}
                min={minDate}
                max={today}
                onChange={(e) => updateFormData({ date: e.target.value })}
                className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors appearance-none relative z-10 
                ${isDateError 
                    ? 'border-red-100 focus:border-red-100 focus:ring-red-100' 
                    : 'border-general-30 focus:border-green-100 focus:ring-green-100'
                }`}
                style={{ colorScheme: "light" }} 
            />
            </div>
            {isDateError && (
                <div className="flex items-center gap-2 mt-2 text-red-100 animate-fadeIn">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs font-medium">
                        {isYearInvalid ? "Tahun tidak valid." : 
                        isDateFuture ? "Tanggal tidak boleh masa depan." : 
                        "Tanggal terlalu lampau."}
                    </p>
                </div>
            )}
        </div>

        <div>
            <label htmlFor="time" className="block body-sm font-medium text-general-80 mb-2">
            Jam Kejadian <span className="text-red-100">*</span>
            </label>
            <div className="relative">
                <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => updateFormData({ time: e.target.value })}
                    className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors appearance-none relative z-10
                    ${isTimeError 
                        ? 'border-red-100 focus:border-red-100 focus:ring-red-100' 
                        : 'border-general-30 focus:border-green-100 focus:ring-green-100'
                    }`}
                    style={{ colorScheme: "light" }}
                />
                 <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
                    <Clock className="w-5 h-5" />
                </div>
            </div>
            {isTimeError ? (
                <div className="flex items-center gap-2 mt-2 text-red-100 animate-fadeIn">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs font-medium">Waktu belum terjadi.</p>
                </div>
            ) : (
                <p className="text-xs text-general-60 mt-2">Perkiraan waktu kejadian (WIB/WITA/WIT).</p>
            )}
        </div>
      </div>

      {/* Grid Wilayah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="province" className="block body-sm font-medium text-general-80 mb-2">
            Provinsi <span className="text-red-100">*</span>
          </label>
          <div className="relative">
            <select
              id="province"
              value={formData.province}
              onChange={(e) => updateFormData({ province: e.target.value, city: "", district: "" })}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Pilih provinsi</option>
              {provinces.map((prov) => (
                <option key={prov.value} value={prov.value}>
                  {prov.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block body-sm font-medium text-general-80 mb-2">
            Kota/Kabupaten <span className="text-red-100">*</span>
          </label>
          <div className="relative">
            <select
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value, district: "" })}
              disabled={!formData.province}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed disabled:text-general-60"
            >
              <option value="">Pilih kota/kab</option>
              {availableCities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

         <div className="md:col-span-2">
          <label htmlFor="district" className="block body-sm font-medium text-general-80 mb-2">
            Kecamatan <span className="text-red-100">*</span>
          </label>
          <div className="relative">
            <select
              id="district"
              value={formData.district || ""} 
              onChange={(e) => updateFormData({ district: e.target.value })}
              disabled={!formData.city}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed disabled:text-general-60"
            >
              <option value="">Pilih kecamatan</option>
              {availableDistricts.length > 0 ? (
                availableDistricts.map((dist) => (
                  <option key={dist.value} value={dist.value}>
                    {dist.label}
                  </option>
                ))
              ) : (
                <option value="" disabled>Data tidak tersedia</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Specific Location */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="location" className="block body-sm font-medium text-general-80">
            Lokasi Spesifik <span className="text-red-100">*</span>
          </label>
          <span className={`text-xs ${currentLength === maxLength ? 'text-red-100 font-bold' : 'text-general-60'}`}>
            {currentLength}/{maxLength} Karakter
          </span>
        </div>
        
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={handleLocationChange}
          placeholder="Contoh: SDN Contoh 01, Jl. Merdeka No. 45"
          className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors placeholder:text-general-40 
            ${currentLength === maxLength 
              ? 'border-red-100 focus:ring-red-100 focus:border-red-100' 
              : 'border-general-30 focus:ring-green-100 focus:border-green-100'
            }`}
        />
        {currentLength === maxLength && (
          <p className="text-xs text-red-100 mt-1">
            Batas maksimal karakter tercapai.
          </p>
        )}
      </div>
    </div>
  )
}