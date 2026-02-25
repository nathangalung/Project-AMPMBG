import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { authMiddleware, tempAuthMiddleware, hashToken } from "../middleware/auth"
import { signToken } from "../lib/jwt"

describe("Auth Middleware Extended", () => {
  describe("tempAuthMiddleware", () => {
    const app = new Hono()
    app.use("/temp", tempAuthMiddleware)
    app.get("/temp", (c) => c.json({ user: c.get("user") }))

    test("returns 401 without token", async () => {
      const res = await app.fetch(new Request("http://localhost/temp"))
      expect(res.status).toBe(401)
    })

    test("returns 401 with invalid token", async () => {
      const res = await app.fetch(
        new Request("http://localhost/temp", {
          headers: { Authorization: "Bearer invalid" },
        })
      )
      expect(res.status).toBe(401)
    })

    test("allows temp tokens", async () => {
      const token = await signToken({
        sub: "user-123",
        email: "test@example.com",
        type: "user",
        temp: true,
      })
      const res = await app.fetch(
        new Request("http://localhost/temp", {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.user.id).toBe("user-123")
    })

    test("allows regular user tokens", async () => {
      const token = await signToken({
        sub: "user-456",
        email: "user@example.com",
        type: "user",
      })
      const res = await app.fetch(
        new Request("http://localhost/temp", {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      expect(res.status).toBe(200)
    })

    test("rejects admin tokens", async () => {
      const token = await signToken({
        sub: "admin-1",
        email: "admin@example.com",
        type: "admin",
      })
      const res = await app.fetch(
        new Request("http://localhost/temp", {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      expect(res.status).toBe(401)
    })
  })

  describe("authMiddleware temp rejection", () => {
    const app = new Hono()
    app.use("/auth", authMiddleware)
    app.get("/auth", (c) => c.json({ user: c.get("user") }))

    test("rejects temp tokens with 403", async () => {
      const token = await signToken({
        sub: "user-temp",
        email: "temp@example.com",
        type: "user",
        temp: true,
      })
      const res = await app.fetch(
        new Request("http://localhost/auth", {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      expect(res.status).toBe(403)
      const json = await res.json()
      expect(json.error).toContain("Complete registration")
    })
  })

  describe("hashToken", () => {
    test("returns consistent SHA-256 hash", () => {
      const hash1 = hashToken("test-token")
      const hash2 = hashToken("test-token")
      expect(hash1).toBe(hash2)
      expect(hash1.length).toBe(64)
    })

    test("different tokens produce different hashes", () => {
      const hash1 = hashToken("token-a")
      const hash2 = hashToken("token-b")
      expect(hash1).not.toBe(hash2)
    })
  })
})
