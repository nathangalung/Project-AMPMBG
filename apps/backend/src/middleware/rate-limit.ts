import { createMiddleware } from "hono/factory"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5min
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 5 * 60 * 1000)

// Extract client IP (prefer Cloudflare header)
function getClientIp(c: { header: (name: string) => string | undefined }): string {
  const cfIp = c.header("cf-connecting-ip")
  if (cfIp) return cfIp
  const realIp = c.header("x-real-ip")
  if (realIp) return realIp
  const forwarded = c.header("x-forwarded-for")
  if (!forwarded) return "unknown"
  const first = forwarded.split(",")[0].trim()
  return /^[\d.:a-fA-F]+$/.test(first) ? first : "unknown"
}

export function rateLimiter(maxRequests: number, windowMs: number) {
  return createMiddleware(async (c, next) => {
    if (process.env.NODE_ENV === "test") {
      await next()
      return
    }

    const ip = getClientIp(c.req)
    const path = c.req.path
    const key = `${ip}:${path}`
    const now = Date.now()

    const entry = store.get(key)
    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header("Retry-After", String(retryAfter))
      return c.json({ error: "Too many requests" }, 429)
    }

    entry.count++
    await next()
  })
}
