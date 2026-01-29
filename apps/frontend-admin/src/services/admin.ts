import { api } from "@/lib/api"
import type { Report, ReportDetail, ReportStatus, ReportCategory, PaginatedResponse } from "./reports"

// --- EXISTING INTERFACES ---
export interface DashboardStats {
  users: {
    total: number
    byRole: { role: string; count: number }[]
  }
  reports: {
    total: number
    pending: number
    uniqueCities: number
    byStatus: { status: string; count: number }[]
    byCategory: { category: string; count: number }[]
  }
  recentReports: {
    id: string
    title: string
    category: ReportCategory
    status: ReportStatus
    province: string
    city: string
    reporter: string
    createdAt: string
  }[]
}

export interface AdminReport extends Report {
  reporter?: string
  reporterEmail?: string
  reporterPhone?: string
  verifiedBy?: string
  verifiedAt?: string
  adminNotes?: string
}

export interface AdminReportDetail extends ReportDetail {
  reporter?: {
    id: string
    name: string
    email: string
    phone: string
  }
  statusHistory?: {
    id: string
    fromStatus: string | null
    toStatus: string
    notes: string | null
    changedBy: string
    createdAt: string
  }[]
}

export interface AdminReportsQuery {
  [key: string]: unknown
  page?: number
  limit?: number
  status?: ReportStatus
  category?: ReportCategory
  provinceId?: string
  cityId?: string
  startDate?: string
  endDate?: string
  search?: string
}

// --- NEW INTERFACE (KITCHEN CONTENT) ---
export interface KitchenNeedItem {
  id: string
  title: string
  description: string
  imageUrl?: string | null
}

// --- MOCK DATA (SIMULASI DB UNTUK KITCHEN CONTENT) ---
// Variable ini disimpan di memori selama aplikasi berjalan (akan reset saat refresh)
let MOCK_KITCHEN_DATA: KitchenNeedItem[] = [
  {
    id: "1",
    title: "Ahli Gizi",
    description: "Memastikan menu dan porsi memenuhi standar gizi penerima manfaat sesuai kelompok sasaran. Ini juga mengurangi risiko keluhan, alergi, dan ketidaksesuaian menu saat bahan berubah.",
    imageUrl: null
  },
  {
    id: "2",
    title: "Logistik & Supply Chain",
    description: "Manajemen supply chain agar pasokan bahan stabil, kualitas terjaga, dan distribusi tepat waktu. Ini mencegah stockout, lonjakan biaya, dan bahan tidak sesuai spesifikasi.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    title: "Peralatan Dapur",
    description: "Peralatan yang tepat agar kapasitas produksi tercapai secara konsisten dan aman. Peralatan yang sesuai juga mempercepat proses dan menurunkan human error.",
    imageUrl: null
  }
]

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

export const adminService = {
  async getDashboard(): Promise<DashboardStats> {
    return api.get("/admin/dashboard")
  },

  async getReports(query: AdminReportsQuery = {}): Promise<PaginatedResponse<AdminReport>> {
    return api.get(`/admin/reports${buildQueryString(query)}`)
  },

  async getReport(id: string): Promise<{ data: AdminReportDetail }> {
    return api.get(`/admin/reports/${id}`)
  },

  async updateReportStatus(id: string, data: { status: ReportStatus; credibilityLevel?: string; notes?: string }): Promise<{ data: Report; message: string }> {
    return api.patch(`/admin/reports/${id}/status`, data)
  },

  async getReportHistory(id: string): Promise<{
    data: { id: string; fromStatus: string | null; toStatus: string; notes: string | null; changedBy: string; createdAt: string }[]
  }> {
    return api.get(`/admin/reports/${id}/history`)
  },

  async getReportScoring(id: string): Promise<{
    data: {
      scoreRelation: { value: number; max: number; label: string }
      scoreLocationTime: { value: number; max: number; label: string }
      scoreEvidence: { value: number; max: number; label: string }
      scoreNarrative: { value: number; max: number; label: string }
      scoreReporterHistory: { value: number; max: number; label: string }
      scoreSimilarity: { value: number; max: number; label: string }
      totalScore: number
      credibilityLevel: string
    }
  }> {
    return api.get(`/admin/reports/${id}/scoring`)
  },

  async bulkUpdateStatus(reportIds: string[], status: ReportStatus, notes?: string): Promise<{ message: string; updated: number }> {
    return api.patch("/admin/reports/bulk-status", { reportIds, status, notes })
  },

  async deleteReport(id: string): Promise<{ message: string }> {
    return api.delete(`/admin/reports/${id}`)
  },

  async getAnalytics(year?: number, month?: number): Promise<{
    overview: {
      totalReports: number
      last30Days: number
      last7Days: number
      totalUsers: number
      activeUsers: number
      highRiskReports: number
      mediumRiskReports: number
      lowRiskReports: number
    }
    trends: {
      data: { label: string; count: number }[]
      isMonthly: boolean
    }
    topProvinces: { provinceId: string; province: string; count: number }[]
    topCities: { cityId: string; city: string; province: string; count: number }[]
    topDistricts: { districtId: string; district: string; city: string; count: number }[]
  }> {
    const params = new URLSearchParams()
    if (year) params.append("year", String(year))
    if (month !== undefined) params.append("month", String(month))
    const query = params.toString() ? `?${params.toString()}` : ""
    return api.get(`/admin/analytics${query}`)
  },

  // --- NEW: KITCHEN CONTENT MANAGEMENT (Mock Implementation) ---
  // Nanti jika backend sudah siap, ganti logika di dalam fungsi ini dengan api.get/post/delete
  kitchen: {
    getAll: async (): Promise<KitchenNeedItem[]> => {
      // Simulasi delay network
      await new Promise(r => setTimeout(r, 500))
      return [...MOCK_KITCHEN_DATA]
    },

    save: async (data: KitchenNeedItem): Promise<KitchenNeedItem> => {
      await new Promise(r => setTimeout(r, 800))
      const existingIndex = MOCK_KITCHEN_DATA.findIndex(item => item.id === data.id)
      
      if (existingIndex > -1) {
        // Update existing
        MOCK_KITCHEN_DATA[existingIndex] = data
      } else {
        // Create new
        const newItem = { ...data, id: Math.random().toString(36).substr(2, 9) }
        MOCK_KITCHEN_DATA.push(newItem)
        return newItem
      }
      return data
    },

    delete: async (id: string): Promise<boolean> => {
      await new Promise(r => setTimeout(r, 500))
      MOCK_KITCHEN_DATA = MOCK_KITCHEN_DATA.filter(item => item.id !== id)
      return true
    }
  }
}