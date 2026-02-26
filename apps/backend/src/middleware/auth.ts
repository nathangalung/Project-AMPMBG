import { createMiddleware } from "hono/factory"
import { eq } from "drizzle-orm"
import { createHash } from "crypto"
import { verifyToken } from "../lib/jwt"
import { db, schema } from "../db"
import type { AuthUser, AuthAdmin } from "../types"

// Hash for DB storage
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex")

type UserVariables = { user: AuthUser }
type AdminVariables = { admin: AuthAdmin }

// Check user session
async function isUserSessionRevoked(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === "test") return false
  const session = await db.query.sessions.findFirst({
    where: eq(schema.sessions.token, hashToken(token)),
  })
  if (!session || session.isRevoked || session.expiresAt < new Date()) return true
  return false
}

// Check admin session
async function isAdminSessionRevoked(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === "test") return false
  const session = await db.query.adminSessions.findFirst({
    where: eq(schema.adminSessions.token, hashToken(token)),
  })
  if (!session || session.isRevoked || session.expiresAt < new Date()) return true
  return false
}

// Public user auth
export const authMiddleware = createMiddleware<{ Variables: UserVariables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Tidak terautentikasi" }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ error: "Token tidak valid" }, 401)
  }

  if (payload.type !== "user") {
    return c.json({ error: "Token pengguna tidak valid" }, 401)
  }

  if (payload.temp === true) {
    return c.json({ error: "Selesaikan pendaftaran terlebih dahulu" }, 403)
  }

  if (await isUserSessionRevoked(token)) {
    return c.json({ error: "Sesi telah dicabut" }, 401)
  }

  c.set("user", {
    id: payload.sub,
    email: payload.email,
    type: "user",
  })

  await next()
})

// Temp token auth (no session check)
export const tempAuthMiddleware = createMiddleware<{ Variables: UserVariables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Tidak terautentikasi" }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ error: "Token tidak valid" }, 401)
  }

  if (payload.type !== "user") {
    return c.json({ error: "Token pengguna tidak valid" }, 401)
  }

  c.set("user", {
    id: payload.sub,
    email: payload.email,
    type: "user",
  })

  await next()
})

// Optional auth check
export const optionalAuthMiddleware = createMiddleware<{ Variables: UserVariables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const payload = await verifyToken(token)

    if (payload && payload.type === "user") {
      c.set("user", {
        id: payload.sub,
        email: payload.email,
        type: "user",
      })
    }
  }

  await next()
})

// Admin-only auth
export const adminMiddleware = createMiddleware<{ Variables: AdminVariables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Tidak terautentikasi" }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ error: "Token tidak valid" }, 401)
  }

  if (payload.type !== "admin") {
    return c.json({ error: "Akses ditolak" }, 403)
  }

  if (await isAdminSessionRevoked(token)) {
    return c.json({ error: "Sesi telah dicabut" }, 401)
  }

  c.set("admin", {
    id: payload.sub,
    email: payload.email,
    type: "admin",
  })

  await next()
})

// Report submission auth
export const reporterMiddleware = createMiddleware<{ Variables: UserVariables }>(async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Harus masuk untuk mengirim laporan" }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ error: "Token tidak valid" }, 401)
  }

  if (payload.type === "admin") {
    return c.json({ error: "Admin tidak dapat mengirim laporan" }, 403)
  }

  if (await isUserSessionRevoked(token)) {
    return c.json({ error: "Sesi telah dicabut" }, 401)
  }

  c.set("user", {
    id: payload.sub,
    email: payload.email,
    type: "user",
  })

  await next()
})
