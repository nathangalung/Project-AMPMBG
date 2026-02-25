import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { rateLimiter } from "../middleware/rate-limit"

describe("Rate Limiter", () => {
  test("bypasses in test environment", async () => {
    const app = new Hono()
    app.use("/test", rateLimiter(1, 60000))
    app.get("/test", (c) => c.json({ ok: true }))

    const res1 = await app.fetch(new Request("http://localhost/test"))
    expect(res1.status).toBe(200)

    const res2 = await app.fetch(new Request("http://localhost/test"))
    expect(res2.status).toBe(200)
  })

  test("extracts IP from x-forwarded-for", async () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    const app = new Hono()
    app.use("/ip", rateLimiter(100, 60000))
    app.get("/ip", (c) => c.json({ ok: true }))

    const res = await app.fetch(
      new Request("http://localhost/ip", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      })
    )
    expect(res.status).toBe(200)

    process.env.NODE_ENV = origEnv
  })

  test("rejects after max requests", async () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    const app = new Hono()
    app.use("/limited", rateLimiter(2, 60000))
    app.get("/limited", (c) => c.json({ ok: true }))

    const req = () =>
      app.fetch(
        new Request("http://localhost/limited", {
          headers: { "x-forwarded-for": "10.20.30.40" },
        })
      )

    const res1 = await req()
    expect(res1.status).toBe(200)

    const res2 = await req()
    expect(res2.status).toBe(200)

    const res3 = await req()
    expect(res3.status).toBe(429)
    const json = await res3.json()
    expect(json.error).toBe("Too many requests")
    expect(res3.headers.get("Retry-After")).toBeDefined()

    process.env.NODE_ENV = origEnv
  })

  test("handles missing x-forwarded-for", async () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    const app = new Hono()
    app.use("/noip", rateLimiter(100, 60000))
    app.get("/noip", (c) => c.json({ ok: true }))

    const res = await app.fetch(new Request("http://localhost/noip"))
    expect(res.status).toBe(200)

    process.env.NODE_ENV = origEnv
  })

  test("handles invalid IP in header", async () => {
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    const app = new Hono()
    app.use("/badip", rateLimiter(100, 60000))
    app.get("/badip", (c) => c.json({ ok: true }))

    const res = await app.fetch(
      new Request("http://localhost/badip", {
        headers: { "x-forwarded-for": "<script>alert(1)</script>" },
      })
    )
    expect(res.status).toBe(200)

    process.env.NODE_ENV = origEnv
  })
})
