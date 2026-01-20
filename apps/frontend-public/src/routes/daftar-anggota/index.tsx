import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useState, useEffect } from "react"
import { ChevronDown, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { authService } from "@/services/auth"
import { api } from "@/lib/api"

export const Route = createFileRoute("/daftar-anggota/")({
  component: DaftarAnggotaPage,
})

const MEMBER_TYPES = [
  { value: "supplier", label: "Supplier/Vendor" },
  { value: "caterer", label: "Katering" },
  { value: "school", label: "Pihak Sekolah" },
  { value: "government", label: "Pemerintah Daerah" },
  { value: "ngo", label: "LSM/NGO" },
  { value: "farmer", label: "Petani/Peternak" },
  { value: "other", label: "Lainnya" },
]

function DaftarAnggotaPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const [formData, setFormData] = useState({
    memberType: "",
    organizationName: "",
    organizationEmail: "",
    organizationPhone: "",
    roleDescription: "",
    mbgDescription: "",
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      navigate({ to: "/auth/login" })
    } else if (user.role !== "public") {
      navigate({ to: "/profil" })
    } else {
      setIsAuthenticated(true)
    }
    setIsChecking(false)
  }, [navigate])

  const isPhoneValid = /^\d{9,15}$/.test(formData.organizationPhone)
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizationEmail)
  const isNameValid = formData.organizationName.trim().length >= 3
  const isRoleDescValid = formData.roleDescription.trim().length >= 10
  const isMbgDescValid = formData.mbgDescription.trim().length >= 10

  const isValid =
    formData.memberType !== "" &&
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isRoleDescValid &&
    isMbgDescValid

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    if (/^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, organizationPhone: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setError("")
    setIsLoading(true)

    try {
      await api.post("/auth/apply-member", formData)
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-100" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-general-20 py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-general-60 hover:text-blue-100 transition-colors body-sm font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <div className="bg-general-20 border border-general-30 rounded-xl p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="h3 text-general-100 mb-2">Daftar Sebagai Anggota AMP MBG</h1>
                <p className="body-sm text-general-60">
                  Lengkapi informasi organisasi/komunitas Anda untuk bergabung sebagai anggota resmi AMP MBG.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-20 border border-red-100 text-red-100 px-4 py-3 rounded-lg body-sm">
                    {error}
                  </div>
                )}

                <fieldset className="border border-general-30 rounded-lg px-3 pb-3 pt-1 focus-within:border-blue-100 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                  <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                    Jenis Organisasi/Komunitas
                  </legend>
                  <div className="relative flex items-center">
                    <select
                      name="memberType"
                      value={formData.memberType}
                      onChange={handleChange}
                      className="w-full outline-none text-general-100 bg-transparent body-sm cursor-pointer appearance-none pr-8"
                      disabled={isLoading}
                    >
                      <option value="" disabled>Pilih jenis organisasi/komunitas</option>
                      {MEMBER_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 w-4 h-4 text-general-60 pointer-events-none" />
                  </div>
                </fieldset>

                <div className="flex flex-col gap-1">
                  <fieldset className={`border rounded-lg px-3 pb-3 pt-1 transition-all ${
                    formData.organizationName.length > 0 && !isNameValid
                      ? "border-red-100 focus-within:ring-red-100"
                      : "border-general-30 focus-within:border-blue-100 focus-within:ring-blue-100"
                  }`}>
                    <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                      Nama Organisasi/Komunitas
                    </legend>
                    <input
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      type="text"
                      placeholder="Masukkan nama organisasi/komunitas"
                      className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent"
                      disabled={isLoading}
                    />
                  </fieldset>
                  {formData.organizationName.length > 0 && !isNameValid && (
                    <p className="text-[10px] text-red-100 px-1">Min. 3 karakter ({formData.organizationName.trim().length}/3)</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <fieldset className={`border rounded-lg px-3 pb-3 pt-1 transition-all ${
                    formData.organizationEmail.length > 0 && !isEmailValid
                      ? "border-red-100 focus-within:ring-red-100"
                      : "border-general-30 focus-within:border-blue-100 focus-within:ring-blue-100"
                  }`}>
                    <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                      Surel Organisasi/Komunitas
                    </legend>
                    <input
                      name="organizationEmail"
                      value={formData.organizationEmail}
                      onChange={handleChange}
                      type="email"
                      placeholder="contoh@organisasi.com"
                      className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent"
                      disabled={isLoading}
                    />
                  </fieldset>
                  {formData.organizationEmail.length > 0 && !isEmailValid && (
                    <p className="text-[10px] text-red-100 px-1">Format: nama@domain.com</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <fieldset className={`border rounded-lg px-3 pb-3 pt-1 transition-all ${
                    formData.organizationPhone.length > 0 && !isPhoneValid
                      ? "border-red-100 focus-within:ring-red-100"
                      : "border-general-30 focus-within:border-blue-100 focus-within:ring-blue-100"
                  }`}>
                    <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                      Nomor Telepon Organisasi/Komunitas
                    </legend>
                    <div className="flex items-center gap-2">
                      <span className="text-general-100 font-medium body-sm bg-general-30/30 px-2 py-0.5 rounded text-sm select-none">
                        +62
                      </span>
                      <input
                        name="organizationPhone"
                        value={formData.organizationPhone}
                        onChange={handlePhoneInput}
                        type="tel"
                        maxLength={15}
                        placeholder="8xxxxxxxxxx"
                        className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent"
                        disabled={isLoading}
                      />
                    </div>
                  </fieldset>
                  <div className="flex justify-between items-start px-1">
                    <p className="text-[10px] text-general-50">Tanpa angka 0 di awal</p>
                    {formData.organizationPhone.length > 0 && !isPhoneValid && (
                      <p className="text-[10px] text-red-100 font-medium">9-15 angka</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <fieldset className={`border rounded-lg px-3 pb-3 pt-1 transition-all ${
                    formData.roleDescription.length > 0 && !isRoleDescValid
                      ? "border-red-100 focus-within:ring-red-100"
                      : "border-general-30 focus-within:border-blue-100 focus-within:ring-blue-100"
                  }`}>
                    <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                      Deskripsi Peran Anda di Organisasi/Komunitas
                    </legend>
                    <textarea
                      name="roleDescription"
                      value={formData.roleDescription}
                      onChange={handleChange}
                      placeholder="Jelaskan peran dan tanggung jawab Anda di organisasi/komunitas tersebut..."
                      rows={3}
                      className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent resize-none"
                      disabled={isLoading}
                    />
                  </fieldset>
                  <div className="flex justify-between items-start px-1">
                    <p className="text-[10px] text-general-50">Min. 10 karakter</p>
                    {formData.roleDescription.length > 0 && !isRoleDescValid && (
                      <p className="text-[10px] text-red-100 font-medium">{formData.roleDescription.trim().length}/10</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <fieldset className={`border rounded-lg px-3 pb-3 pt-1 transition-all ${
                    formData.mbgDescription.length > 0 && !isMbgDescValid
                      ? "border-red-100 focus-within:ring-red-100"
                      : "border-general-30 focus-within:border-blue-100 focus-within:ring-blue-100"
                  }`}>
                    <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">
                      Deskripsi Peran Organisasi/Komunitas Anda Terkait MBG
                    </legend>
                    <textarea
                      name="mbgDescription"
                      value={formData.mbgDescription}
                      onChange={handleChange}
                      placeholder="Jelaskan bagaimana organisasi/komunitas Anda terlibat atau berkontribusi dalam program MBG..."
                      rows={3}
                      className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent resize-none"
                      disabled={isLoading}
                    />
                  </fieldset>
                  <div className="flex justify-between items-start px-1">
                    <p className="text-[10px] text-general-50">Min. 10 karakter</p>
                    {formData.mbgDescription.length > 0 && !isMbgDescValid && (
                      <p className="text-[10px] text-red-100 font-medium">{formData.mbgDescription.trim().length}/10</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className={`w-full py-3 font-heading font-semibold rounded-lg transition-all shadow-sm body-sm flex justify-center items-center gap-2 ${
                    isValid && !isLoading
                      ? "bg-blue-100 hover:bg-blue-90 text-general-20 cursor-pointer"
                      : "bg-general-30 text-general-60 cursor-not-allowed opacity-70"
                  }`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Memproses..." : "Daftar Sebagai Anggota"}
                  {isValid && !isLoading && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-general-20 rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="h4 text-general-100 mb-3">Pendaftaran Terkirim</h3>
              <p className="body-sm text-general-60">
                Pendaftaran organisasi/komunitas Anda sebagai anggota AMP MBG sedang diproses.
                Silakan tunggu konfirmasi lebih lanjut atau hubungi tim AMP MBG.
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/profil" })}
              className="w-full py-2.5 bg-blue-100 text-white font-medium rounded-lg hover:bg-blue-90 transition-colors body-sm shadow-sm"
            >
              Kembali ke Profil
            </button>
          </div>
        </div>
      )}
    </>
  )
}
