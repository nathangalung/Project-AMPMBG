import { useState, useMemo, useCallback, memo } from "react"
import { useMutation } from "@tanstack/react-query"
import { StepLocationCategory } from "./step-location-category"
import { StepChronologyEvidence } from "./step-chronology-evidence"
import { StepIdentityConfirmation } from "./step-identity-confirmation"
import { reportsService, type CreateReportRequest, type ReportCategory, type ReporterRelation } from "@/services/reports"
import { queryClient } from "@/lib/query-client"
import { cn } from "@/lib/utils"
import { CheckCircle2, ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react"

const STEPS = [
  { id: 1, title: "Lokasi", subtitle: "Detail Lokasi" },
  { id: 2, title: "Bukti", subtitle: "Kronologi & Foto" },
  { id: 3, title: "Konfirmasi", subtitle: "Identitas Pelapor" },
]

export type Timezone = "WIB" | "WITA" | "WIT"

export interface ReportFormData {
  title: string
  category: string
  date: string
  time: string
  timezone: Timezone
  province: string
  city: string
  district: string
  location: string
  latitude?: number
  longitude?: number
  description: string
  files: File[]
  relation: string
  relationDetail?: string
  agreement: boolean
}

const INITIAL_FORM_DATA: ReportFormData = {
  title: "",
  category: "",
  date: "",
  time: "",
  timezone: "WIB",
  province: "",
  city: "",
  district: "",
  location: "",
  description: "",
  files: [],
  relation: "",
  agreement: false,
}

function ReportFormComponent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ReportFormData>(INITIAL_FORM_DATA)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createReportMutation = useMutation({
    mutationFn: async () => {
      const incidentDate = `${formData.date}T${formData.time}:00`
      
      const reportData: CreateReportRequest = {
        category: formData.category as ReportCategory,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        provinceId: formData.province,
        cityId: formData.city,
        districtId: formData.district || undefined,
        incidentDate,
        relation: formData.relation as ReporterRelation,
        relationDetail: formData.relationDetail || undefined,
      }

      const response = await reportsService.createReport(reportData)
      
      if (formData.files.length > 0 && response.data.id) {
        await reportsService.uploadFiles(response.data.id, formData.files)
      }
      return response
    },
    onSuccess: () => {
      setIsSubmitted(true)
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ["profile", "reports"] })
    },
    onError: (error: any) => {
      let message = "Terjadi kesalahan saat mengirim laporan."
      if (error?.issues && Array.isArray(error.issues) && error.issues.length > 0) {
        message = error.issues[0].message
      } else if (typeof error?.message === 'object' && error.message !== null) {
         if (error.message.issues && Array.isArray(error.message.issues)) {
            message = error.message.issues[0].message
         } else {
            message = "Terjadi kesalahan validasi data."
         }
      } else if (typeof error?.message === 'string') {
        message = error.message
      }
      setSubmitError(message)
    },
  })

  const isStepValid = useMemo(() => {
    if (currentStep === 1) {
      return (
        formData.title.trim().length >= 10 &&
        formData.category &&
        formData.date &&
        formData.time &&
        formData.province &&
        formData.city &&
        formData.location
      )
    }
    if (currentStep === 2) {
      return formData.description.trim().length >= 50
    }
    if (currentStep === 3) {
      return formData.relation && formData.agreement
    }
    return false
  }, [currentStep, formData])

  const updateFormData = useCallback((data: Partial<ReportFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const nextStep = useCallback(() => setCurrentStep((s) => (s < 3 ? s + 1 : s)), [])
  const prevStep = useCallback(() => setCurrentStep((s) => (s > 1 ? s - 1 : s)), [])
  const handleSubmit = useCallback(() => { setSubmitError(null); createReportMutation.mutate() }, [createReportMutation])

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-blue-30/50 p-8 md:p-16 text-center animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-green-20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
          <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-100" />
        </div>
        <h2 className="h3 text-general-100 mb-3">Laporan Diterima!</h2>
        <p className="body-md text-general-60 mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
          Terima kasih atas partisipasi Anda. Tim kami akan segera memverifikasi laporan ini demi program MBG yang lebih baik.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-8 py-3.5 md:px-10 md:py-4 bg-blue-100 hover:bg-blue-90 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 body-sm w-full sm:w-auto"
        >
          Kembali ke Beranda
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-blue-30/30 overflow-hidden w-full transition-all">
      
      <div className="bg-general-20/30 border-b border-general-30 px-5 py-5 md:px-10 md:py-6">
        <div className="flex items-center justify-between relative max-w-3xl mx-auto">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-general-30 -z-10 hidden sm:block transform -translate-y-1/2 rounded-full mx-4" />
          {STEPS.map((step) => {
            const isActive = currentStep >= step.id
            const isCurrent = currentStep === step.id
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 bg-white sm:px-4 rounded-full py-1">
                <div className={cn("w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 border-2", isActive ? "bg-blue-100 border-blue-100 text-white shadow-md scale-105" : "bg-white border-general-30 text-general-50")}>
                  {step.id}
                </div>
                <p className={cn("text-[10px] md:text-xs font-bold mt-2 uppercase tracking-wide transition-colors hidden sm:block", isCurrent ? "text-blue-100" : "text-general-50")}>
                  {step.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-5 md:p-10 lg:p-12">
        <div className="mb-8 md:mb-10 text-center sm:text-left">
          <h2 className="text-xl md:text-3xl font-heading font-bold text-general-100">
            {STEPS[currentStep - 1].subtitle}
          </h2>
          <p className="text-general-60 text-xs md:text-sm mt-1.5">Lengkapi data berikut dengan informasi yang valid.</p>
        </div>

        <div className="w-full">
          {currentStep === 1 && <StepLocationCategory formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <StepChronologyEvidence formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StepIdentityConfirmation formData={formData} updateFormData={updateFormData} />}
        </div>

        {submitError && (
          <div className="mt-6 md:mt-8 p-4 bg-red-20 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <p className="text-red-100 body-sm font-medium">{submitError}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between mt-10 md:mt-12 pt-6 md:pt-8 border-t border-general-30 gap-3 sm:gap-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn("w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors", currentStep > 1 ? "text-general-60 hover:bg-general-20 hover:text-blue-100 border border-transparent hover:border-general-30" : "text-transparent cursor-default hidden sm:flex")}
          >
            <ArrowLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-100 hover:bg-blue-90 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95 body-sm"
            >
              Selanjutnya
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createReportMutation.isPending || !isStepValid}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 bg-orange-100 hover:bg-orange-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-100/20 hover:shadow-orange-100/40 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 body-sm"
            >
              {createReportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </> 
              ) : (
                <>
                  Kirim Laporan
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const ReportForm = memo(ReportFormComponent)