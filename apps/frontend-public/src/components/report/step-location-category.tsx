import { memo, useCallback, useMemo, Suspense, lazy } from "react"
import { ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { ReportFormData, Timezone } from "./report-form"
import { categoriesService } from "@/services/categories"
import { locationsService } from "@/services/locations"

const LocationMapPreview = lazy(() =>
  import("./location-map-preview").then((m) => ({ default: m.LocationMapPreview }))
)

interface StepLocationCategoryProps {
  formData: ReportFormData
  updateFormData: (data: Partial<ReportFormData>) => void
}

const TIMEZONES: { value: Timezone; label: string; offset: number }[] = [
  { value: "WIB", label: "WIB", offset: 7 },
  { value: "WITA", label: "WITA", offset: 8 },
  { value: "WIT", label: "WIT", offset: 9 },
]

function StepLocationCategoryComponent({ formData, updateFormData }: StepLocationCategoryProps) {
  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoriesService.getCategories()
      return response.data
    },
    staleTime: 1000 * 60 * 60,
  })

  // Fetch provinces from API
  const { data: provincesData, isLoading: provincesLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const response = await locationsService.getProvinces()
      return response.data
    },
    staleTime: 1000 * 60 * 60,
  })

  // Fetch cities based on selected province
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", formData.province],
    queryFn: async () => {
      if (!formData.province) return []
      const response = await locationsService.getCities(formData.province)
      return response.data
    },
    enabled: !!formData.province,
    staleTime: 1000 * 60 * 30,
  })

  // Fetch districts based on selected city
  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ["districts", formData.city],
    queryFn: async () => {
      if (!formData.city) return []
      const response = await locationsService.getDistricts(formData.city)
      return response.data
    },
    enabled: !!formData.city,
    staleTime: 1000 * 60 * 30,
  })

  const categories = categoriesData || []
  const provinces = provincesData || []
  const availableCities = citiesData || []
  const availableDistricts = districtsData || []

  const MAX_TITLE_WORDS = 10
  const MAX_LOCATION_LENGTH = 100
  const MIN_DATE = "2024-01-01"

  const currentTitleWords = useMemo(
    () => (formData.title ? formData.title.trim().split(/\s+/).filter(Boolean).length : 0),
    [formData.title]
  )

  const currentLength = formData.location.length

  const { todayInTz, isDateError, isDateFuture, isYearInvalid, isTimeError } = useMemo(() => {
    const now = new Date()
    const tz = TIMEZONES.find((t) => t.value === formData.timezone) || TIMEZONES[0]

    // Convert to selected timezone
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const tzDate = new Date(utc + tz.offset * 3600000)
    const todayStr = tzDate.toISOString().split("T")[0]
    const timeStr = tzDate.toTimeString().slice(0, 5)

    // Validate date
    const isFuture = formData.date > todayStr
    const isTooOld = formData.date < MIN_DATE && formData.date !== ""
    const isYearInv = formData.date.split("-")[0].length > 4

    // Validate time (only if same day)
    const timeError = formData.date === todayStr && formData.time > timeStr

    return {
      todayInTz: todayStr,
      isDateFuture: isFuture,
      isYearInvalid: isYearInv,
      isDateError: isFuture || isTooOld || isYearInv,
      isTimeError: timeError,
    }
  }, [formData.date, formData.time, formData.timezone])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const wordCount = inputValue.trim().split(/\s+/).filter(Boolean).length
      if (wordCount <= MAX_TITLE_WORDS) {
        updateFormData({ title: inputValue })
      } else {
        const isTrailingSpace = inputValue.endsWith(" ")
        if (wordCount === MAX_TITLE_WORDS + 1 && !isTrailingSpace) return
        updateFormData({ title: inputValue })
      }
    },
    [updateFormData]
  )

  const handleLocationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length <= MAX_LOCATION_LENGTH) {
        updateFormData({ location: e.target.value })
      }
    },
    [updateFormData]
  )

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ category: e.target.value }), [updateFormData])
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ date: e.target.value }), [updateFormData])
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ time: e.target.value }), [updateFormData])
  const handleTimezoneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ timezone: e.target.value as Timezone }), [updateFormData])
  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ province: e.target.value, city: "", district: "", latitude: undefined, longitude: undefined }), [updateFormData])
  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ city: e.target.value, district: "", latitude: undefined, longitude: undefined }), [updateFormData])
  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ district: e.target.value, latitude: undefined, longitude: undefined }), [updateFormData])

  const handleCoordinatesChange = useCallback(
    (lat: number, lng: number) => updateFormData({ latitude: lat, longitude: lng }),
    [updateFormData]
  )

  const locationNames = useMemo(() => ({
    province: provinces.find((p) => p.id === formData.province)?.name || "",
    city: availableCities.find((c) => c.id === formData.city)?.name || "",
    district: availableDistricts.find((d) => d.id === formData.district)?.name || "",
  }), [provinces, availableCities, availableDistricts, formData.province, formData.city, formData.district])

  return (
    <div className="space-y-6">
      
      {/* JUDUL LAPORAN (Maksimal 10 Kata) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="title" className="block body-sm font-medium text-general-80">
            Judul Laporan <span className="text-red-100">*</span>
          </label>
          <span className={`text-xs ${currentTitleWords === MAX_TITLE_WORDS ? 'text-red-100 font-bold' : 'text-general-60'}`}>
            {currentTitleWords}/{MAX_TITLE_WORDS} Kata
          </span>
        </div>
        
        <input
          type="text"
          id="title"
          value={formData.title || ""}
          onChange={handleTitleChange}
          placeholder="Contoh: Keracunan Makanan Siswa SD Harapan Bangsa"
          className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors placeholder:text-general-40
            ${currentTitleWords > MAX_TITLE_WORDS
              ? 'border-red-100 focus:ring-red-100 focus:border-red-100'
              : 'border-general-30 focus:ring-green-100 focus:border-green-100'
            }`}
        />
        {currentTitleWords >= MAX_TITLE_WORDS && (
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
            onChange={handleCategoryChange}
            disabled={categoriesLoading}
            className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed"
          >
            <option value="">
              {categoriesLoading ? "Memuat kategori..." : "Pilih kategori laporan"}
            </option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
            {categoriesLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Grid Tanggal & Waktu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
            <label htmlFor="date" className="block body-sm font-medium text-general-80 mb-2">
            Tanggal Kejadian <span className="text-red-100">*</span>
            </label>
            <input
                type="date"
                id="date"
                lang="id-ID"
                value={formData.date}
                min={MIN_DATE}
                max={todayInTz}
                onChange={handleDateChange}
                className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors appearance-none
                ${isDateError
                    ? 'border-red-100 focus:border-red-100 focus:ring-red-100'
                    : 'border-general-30 focus:border-green-100 focus:ring-green-100'
                }`}
                style={{ colorScheme: "light" }}
            />
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
            <div className="flex gap-2">
              <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={handleTimeChange}
                  className={`flex-1 px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors appearance-none
                  ${isTimeError
                      ? 'border-red-100 focus:border-red-100 focus:ring-red-100'
                      : 'border-general-30 focus:border-green-100 focus:ring-green-100'
                  }`}
                  style={{ colorScheme: "light" }}
              />
              <select
                id="timezone"
                value={formData.timezone}
                onChange={handleTimezoneChange}
                className="px-3 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 font-medium focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors cursor-pointer"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            {isTimeError && (
                <div className="flex items-center gap-2 mt-2 text-red-100 animate-fadeIn">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs font-medium">Waktu belum terjadi.</p>
                </div>
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
              onChange={handleProvinceChange}
              disabled={provincesLoading}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed"
            >
              <option value="">
                {provincesLoading ? "Memuat provinsi..." : "Pilih provinsi"}
              </option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              {provincesLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
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
              onChange={handleCityChange}
              disabled={!formData.province || citiesLoading}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed disabled:text-general-60"
            >
              <option value="">
                {citiesLoading ? "Memuat kota..." : "Pilih kota/kab"}
              </option>
              {availableCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              {citiesLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
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
              onChange={handleDistrictChange}
              disabled={!formData.city || districtsLoading}
              className="w-full px-4 py-3 bg-general-20 border border-general-30 rounded-lg text-general-100 focus:ring-2 focus:ring-green-100 focus:border-green-100 transition-colors appearance-none cursor-pointer disabled:bg-general-30/30 disabled:cursor-not-allowed disabled:text-general-60"
            >
              <option value="">
                {districtsLoading ? "Memuat kecamatan..." : "Pilih kecamatan"}
              </option>
              {availableDistricts.length > 0 ? (
                availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name}
                  </option>
                ))
              ) : (
                !districtsLoading && formData.city && (
                  <option value="" disabled>Data tidak tersedia</option>
                )
              )}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-general-60">
              {districtsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
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
          <span className={`text-xs ${currentLength === MAX_LOCATION_LENGTH ? 'text-red-100 font-bold' : 'text-general-60'}`}>
            {currentLength}/{MAX_LOCATION_LENGTH} Karakter
          </span>
        </div>
        
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={handleLocationChange}
          placeholder="Contoh: SDN Contoh 01, Jl. Merdeka No. 45"
          className={`w-full px-4 py-3 bg-general-20 border rounded-lg text-general-100 focus:ring-2 transition-colors placeholder:text-general-40
            ${currentLength === MAX_LOCATION_LENGTH
              ? 'border-red-100 focus:ring-red-100 focus:border-red-100'
              : 'border-general-30 focus:ring-green-100 focus:border-green-100'
            }`}
        />
        {currentLength === MAX_LOCATION_LENGTH && (
          <p className="text-xs text-red-100 mt-1">
            Batas maksimal karakter tercapai.
          </p>
        )}
      </div>

      {/* Map Preview - Shows after district is selected */}
      {formData.district && (
        <Suspense
          fallback={
            <div className="h-[200px] bg-general-30/30 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-general-50" />
            </div>
          }
        >
          <LocationMapPreview
            provinceName={locationNames.province}
            cityName={locationNames.city}
            districtName={locationNames.district}
            specificLocation={formData.location}
            onCoordinatesChange={handleCoordinatesChange}
          />
        </Suspense>
      )}
    </div>
  )
}

export const StepLocationCategory = memo(StepLocationCategoryComponent)
