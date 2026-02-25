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

// Extract client IP
function getClientIp(header: string | undefined): string {
  if (!header) return "unknown"
  const first = header.split(",")[0].trim()
  return /^[\d.:a-fA-F]+$/.test(first) ? first : "unknown"
}

export function rateLimiter(maxRequests: number, windowMs: number) {
  return createMiddleware(async (c, next) => {
    if (process.env.NODE_ENV === "test") {
      await next()
      return
    }

    const ip = getClientIp(c.req.header("x-forwarded-for"))
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
