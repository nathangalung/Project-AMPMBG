import { api } from "@/lib/api"

export interface Admin {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  adminRole: string | null
  isVerified: boolean
  createdAt: string
}

export interface Associate {
  id: string
  name: string
  email: string
  phone: string
  nik: string
  role: string
  memberType: string | null
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface CreateAdminData {
  name: string
  email: string
  password: string
  adminRole: string
}

export interface CreateAssociateData {
  nik: string
  name: string
  email: string
  phone: string
  password: string
  memberType: "supplier" | "caterer" | "school" | "government" | "ngo" | "farmer" | "other"
}

export const adminAccountService = {
  getAdmins: async (status: "verified" | "pending" | "all" = "all"): Promise<{ data: Admin[] }> => {
    return api.get(`/admin/admins?status=${status}`)
  },

  createAdmin: async (data: CreateAdminData): Promise<{ data: Admin; message: string }> => {
    return api.post("/admin/admins", data)
  },

  deleteAdmin: async (id: string): Promise<{ message: string }> => {
    return api.delete(`/admin/admins/${id}`)
  },
}

export const associateService = {
  getAssociates: async (status: "verified" | "pending" | "all" = "all"): Promise<{ data: Associate[] }> => {
    return api.get(`/admin/associates?status=${status}`)
  },

  createAssociate: async (data: CreateAssociateData): Promise<{ data: Associate; message: string }> => {
    return api.post("/admin/associates", data)
  },

  verifyAssociate: async (id: string): Promise<{ message: string }> => {
    return api.patch(`/admin/associates/${id}/verify`)
  },

  deleteAssociate: async (id: string): Promise<{ message: string }> => {
    return api.delete(`/admin/associates/${id}`)
  },
}
