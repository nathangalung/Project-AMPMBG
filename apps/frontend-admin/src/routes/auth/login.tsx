import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { AuthLayout } from "@/components/auth/auth-layout"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { authService } from "@/services/auth"

export const Route = createFileRoute("/auth/login")({
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authService.login({ identifier, password })
      if (response.user.role !== "admin") {
        setError("Akses ditolak. Hanya admin yang dapat masuk.")
        authService.logout()
        return
      }
      navigate({ to: "/dashboard" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="h3 text-general-100 mb-2">Selamat Datang, Admin!</h1>
        <p className="body-md text-general-60">Masuk ke dashboard admin</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-red-20 border border-red-100 text-red-100 px-4 py-3 rounded-lg body-sm">
            {error}
          </div>
        )}

        <fieldset className="border border-general-30 rounded-lg px-3 pb-3 pt-1 focus-within:border-blue-100 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">Surel</legend>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukkan surel admin"
            className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent"
            disabled={isLoading}
          />
        </fieldset>

        <fieldset className="border border-general-30 rounded-lg px-3 pb-3 pt-1 focus-within:border-blue-100 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <legend className="body-xs text-general-60 px-2 font-medium bg-general-20">Kata Sandi</legend>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full outline-none text-general-100 placeholder:text-general-40 body-sm bg-transparent"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-general-40 hover:text-general-60 transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isLoading || !identifier || !password}
          className="w-full py-3 bg-blue-100 hover:bg-blue-90 text-general-20 font-heading font-semibold rounded-lg transition-colors shadow-sm body-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center body-xs text-general-50 mt-8">
        Hubungi administrator jika mengalami kendala akses.
      </p>
    </AuthLayout>
  )
}
