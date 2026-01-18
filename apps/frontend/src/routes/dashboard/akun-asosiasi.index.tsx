import { createFileRoute } from "@tanstack/react-router"
import { DashboardAnggotaLayout } from "@/components/dashboard/dashboard-anggota-layout"
import {
  Search,
  Loader2,
  UserCheck,
  Mail,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown
} from "lucide-react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { associateService, type Associate, type CreateAssociateData } from "@/services/members"

export const Route = createFileRoute("/dashboard/akun-asosiasi/")({
  component: AkunAsosiasiPage,
})

const MEMBER_TYPE_OPTIONS = [
  { value: "supplier", label: "Supplier/Vendor" },
  { value: "caterer", label: "Katering" },
  { value: "school", label: "Pihak Sekolah" },
  { value: "government", label: "Pemerintah Daerah" },
  { value: "ngo", label: "LSM/NGO" },
  { value: "farmer", label: "Petani" },
  { value: "other", label: "Lainnya" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Ditolak" },
]

const getStatusInfo = (isVerified: boolean, isActive: boolean) => {
  if (!isActive) return { key: "rejected", label: "Ditolak", style: "bg-red-20 text-red-100 border-red-30" }
  if (!isVerified) return { key: "pending", label: "Pending", style: "bg-orange-50 text-orange-700 border-orange-200" }
  return { key: "active", label: "Aktif", style: "bg-green-20 text-green-100 border-green-30" }
}

const getMemberTypeLabel = (type: string | null) => {
  const found = MEMBER_TYPE_OPTIONS.find(opt => opt.value === type)
  return found?.label || type || "-"
}

function AkunAsosiasiPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const { data: associatesData, isLoading } = useQuery({
    queryKey: ["admin", "associates"],
    queryFn: () => associateService.getAssociates("all"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => associateService.deleteAssociate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "associates"] })
      alert("Akun berhasil dihapus.")
    }
  })

  const associates: Associate[] = (associatesData?.data || []).filter((a: Associate) => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nik.includes(searchTerm)
    const matchRole = !filterRole || a.memberType === filterRole
    const statusInfo = getStatusInfo(a.isVerified, a.isActive)
    const matchStatus = !filterStatus || statusInfo.key === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  const handleDelete = (id: string) => {
    if (confirm("Hapus akun ini? Tindakan ini tidak bisa dibatalkan.")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <DashboardAnggotaLayout>
      <div className="p-4 md:p-8">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="h4 text-general-100">Manajemen Akun Asosiasi</h1>
            <p className="body-sm text-general-60 mt-1">Kelola akun mitra program MBG.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-general-20 rounded-lg hover:bg-blue-90 transition-colors body-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Asosiasi</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-general-20 border border-general-30 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block body-sm font-medium text-general-80 mb-1">Cari</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari nama, email, atau NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60" />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block body-sm font-medium text-general-80 mb-1">Peran</label>
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm appearance-none cursor-pointer"
                >
                  <option value="">Semua Peran</option>
                  {MEMBER_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block body-sm font-medium text-general-80 mb-1">Status</label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm appearance-none cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-general-20 border border-general-30 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-100" />
            </div>
          ) : associates.length === 0 ? (
            <div className="p-10 text-center">
              <div className="bg-general-30/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-8 h-8 text-general-50" />
              </div>
              <h3 className="h6 text-general-80">Tidak ada data</h3>
              <p className="body-sm text-general-60 mt-1">Belum ada akun asosiasi terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-general-20 border-b border-general-30 text-general-100 body-sm font-heading font-semibold">
                    <th className="p-4 w-12 text-center border-r border-general-30">No</th>
                    <th className="p-4 min-w-[200px] border-r border-general-30">Nama</th>
                    <th className="p-4 min-w-[200px] border-r border-general-30">Email</th>
                    <th className="p-4 min-w-[150px] border-r border-general-30">Peran</th>
                    <th className="p-4 w-28 text-center border-r border-general-30">Status</th>
                    <th className="p-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-general-30">
                  {associates.map((associate, idx) => {
                    const statusInfo = getStatusInfo(associate.isVerified, associate.isActive)
                    return (
                      <tr key={associate.id} className="hover:bg-general-30/20 transition-colors">
                        <td className="p-4 text-center body-sm text-general-60 border-r border-general-30">{idx + 1}</td>

                        <td className="p-4 border-r border-general-30">
                          <span className="font-bold text-general-100 body-sm">{associate.name}</span>
                        </td>

                        <td className="p-4 border-r border-general-30">
                          <div className="flex items-center gap-2 text-general-80 text-xs">
                            <Mail className="w-3.5 h-3.5 text-blue-100" />
                            {associate.email}
                          </div>
                        </td>

                        <td className="p-4 border-r border-general-30">
                          <span className="inline-flex px-2.5 py-1 rounded-md bg-general-30 text-general-100 text-xs font-semibold">
                            {getMemberTypeLabel(associate.memberType)}
                          </span>
                        </td>

                        <td className="p-4 text-center border-r border-general-30">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.style}`}>
                            {statusInfo.label}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDelete(associate.id)}
                              disabled={deleteMutation.isPending}
                              className="p-2 bg-red-20 text-red-100 hover:bg-red-30 border border-red-30 rounded-lg transition-colors"
                              title="Hapus Akun"
                            >
                              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddAssociateModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            queryClient.invalidateQueries({ queryKey: ["admin", "associates"] })
          }}
        />
      )}
    </DashboardAnggotaLayout>
  )
}

function AddAssociateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateAssociateData>({
    nik: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    memberType: "supplier"
  })
  const [showPassword, setShowPassword] = useState(false)

  const createMutation = useMutation({
    mutationFn: (data: CreateAssociateData) => associateService.createAssociate(data),
    onSuccess: () => {
      alert("Akun asosiasi berhasil dibuat!")
      onSuccess()
    },
    onError: (error: Error) => {
      alert(error.message || "Gagal membuat akun asosiasi")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nik || !formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Mohon lengkapi semua field")
      return
    }
    if (formData.nik.length !== 16) {
      alert("NIK harus 16 digit")
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-general-20 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="h5 text-general-100">Tambah Asosiasi Baru</h3>
          <button onClick={onClose} className="text-general-60 hover:text-general-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">NIK</label>
            <input
              type="text"
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
              className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
              placeholder="16 digit NIK"
              maxLength={16}
            />
          </div>

          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
              placeholder="+628123456789"
            />
          </div>

          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 pr-10 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-general-60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block body-sm font-medium text-general-80 mb-1">Peran</label>
            <div className="relative">
              <select
                value={formData.memberType}
                onChange={(e) => setFormData({ ...formData, memberType: e.target.value as CreateAssociateData["memberType"] })}
                className="w-full px-4 py-2 bg-general-20 border border-general-30 rounded-lg focus:ring-2 focus:ring-blue-100 text-general-100 body-sm appearance-none cursor-pointer"
              >
                {MEMBER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-general-60 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-general-30 text-general-80 font-medium rounded-lg hover:bg-general-30 transition-colors body-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-blue-100 text-general-20 font-medium rounded-lg hover:bg-blue-90 transition-colors body-sm disabled:opacity-50"
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
