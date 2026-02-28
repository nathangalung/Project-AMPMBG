const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials": "Email atau kata sandi salah",
  "Invalid email or password": "Email atau kata sandi salah",
  "Unauthorized": "Sesi Anda telah berakhir, silakan login kembali",
  "Token expired": "Sesi Anda telah berakhir, silakan login kembali",
  "Invalid token": "Token tidak valid, silakan login kembali",
  "Not found": "Data tidak ditemukan",
  "Internal server error": "Terjadi kesalahan pada server",
  "Too many requests": "Terlalu banyak percobaan, silakan coba lagi nanti",
  "Email already exists": "Email sudah terdaftar",
  "Email already registered": "Email sudah terdaftar",
  "User not found": "Pengguna tidak ditemukan",
  "Wrong password": "Kata sandi salah",
  "Invalid password": "Kata sandi tidak valid",
  "Password too short": "Kata sandi terlalu pendek",
  "Passwords do not match": "Kata sandi tidak cocok",
  "Current password is incorrect": "Kata sandi saat ini salah",
  "Email not verified": "Email belum diverifikasi",
  "Account disabled": "Akun Anda telah dinonaktifkan",
  "File too large": "Ukuran file terlalu besar",
  "Invalid file type": "Tipe file tidak didukung",
  "Network error": "Kesalahan jaringan, periksa koneksi internet Anda",
  "Failed to fetch": "Gagal terhubung ke server",
  "Request failed": "Permintaan gagal",
  "Validation error": "Data yang dimasukkan tidak valid",
  "Forbidden": "Anda tidak memiliki akses",
  "Bad request": "Permintaan tidak valid",
  "Service unavailable": "Layanan sedang tidak tersedia",
}

function translateError(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, val] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lower === key.toLowerCase() || lower.includes(key.toLowerCase())) return val
  }
  return message
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// App-specific storage key
const TOKEN_KEY = "public_token"

// Cached token value
let cachedToken: string | null = null

function getToken(): string | null {
  if (cachedToken === null) {
    cachedToken = localStorage.getItem(TOKEN_KEY)
  }
  return cachedToken
}

export function setToken(token: string): void {
  cachedToken = token
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  cachedToken = null
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, signal } = options

  const token = getToken()
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, translateError(data.error || "Permintaan gagal"), data)
  }

  return data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "PUT", body }),
  patch: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "PATCH", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
}

export { ApiError, translateError }
