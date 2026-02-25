import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { Hono } from "hono"
import profile from "../routes/profile"
import { createTestApp, testRequest } from "./setup"
import { db } from "../db"
import { publics, reports, sessions, admins, reportStatusHistory } from "../db/schema"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { signToken } from "../lib/jwt"
import { hashPassword } from "../lib/password"

const app = createTestApp(new Hono().route("/profile", profile))

describe("Profile Coverage - Set Password", () => {
  let googleUserId: string
  let googleUserToken: string
  let passwordUserId: string
  let passwordUserToken: string

  beforeAll(async () => {
    // Google user without password
    const [googleUser] = await db.insert(publics).values({
      email: `google-setpw-${randomBytes(4).toString("hex")}@example.com`,
      name: "Google Set PW User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
      signupMethod: "google",
      googleId: `google-${randomBytes(8).toString("hex")}`,
    }).returning()
    googleUserId = googleUser.id
    googleUserToken = await signToken({ sub: googleUser.id, email: googleUser.email, type: "user" })

    // User with existing password
    const hashedPassword = await hashPassword("Existing1")
    const [pwUser] = await db.insert(publics).values({
      email: `pw-exist-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Password Exists User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    passwordUserId = pwUser.id
    passwordUserToken = await signToken({ sub: pwUser.id, email: pwUser.email, type: "user" })
  })

  afterAll(async () => {
    if (googleUserId) {
      await db.delete(sessions).where(eq(sessions.publicId, googleUserId)).catch(() => {})
      await db.delete(publics).where(eq(publics.id, googleUserId)).catch(() => {})
    }
    if (passwordUserId) {
      await db.delete(sessions).where(eq(sessions.publicId, passwordUserId)).catch(() => {})
      await db.delete(publics).where(eq(publics.id, passwordUserId)).catch(() => {})
    }
  })

  test("sets password for user without one", async () => {
    const res = await testRequest(app, "POST", "/api/profile/password", {
      token: googleUserToken,
      body: { newPassword: "NewPass123", confirmPassword: "NewPass123" },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toContain("set successfully")
  })

  test("rejects set password when already has one", async () => {
    const res = await testRequest(app, "POST", "/api/profile/password", {
      token: passwordUserToken,
      body: { newPassword: "AnotherPass1", confirmPassword: "AnotherPass1" },
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("already set")
  })

  test("rejects mismatched passwords", async () => {
    const res = await testRequest(app, "POST", "/api/profile/password", {
      token: googleUserToken,
      body: { newPassword: "NewPass123", confirmPassword: "DifferentPass1" },
    })
    expect(res.status).toBe(400)
  })

  test("rejects weak password", async () => {
    const res = await testRequest(app, "POST", "/api/profile/password", {
      token: googleUserToken,
      body: { newPassword: "weak", confirmPassword: "weak" },
    })
    expect(res.status).toBe(400)
  })
})

describe("Profile Coverage - Report History Filters", () => {
  let userId: string
  let userToken: string
  let reportId1: string
  let reportId2: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")
    const [user] = await db.insert(publics).values({
      email: `report-hist-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Report History User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    userId = user.id
    userToken = await signToken({ sub: user.id, email: user.email, type: "user" })

    const [r1] = await db.insert(reports).values({
      publicId: user.id,
      category: "poisoning",
      title: "Report History Test 1",
      description: "Report history test description one that is long enough for validation",
      location: "Location 1",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "parent",
    }).returning()
    reportId1 = r1.id

    const [r2] = await db.insert(reports).values({
      publicId: user.id,
      category: "kitchen",
      title: "Report History Test 2",
      description: "Report history test description two that is long enough for validation",
      location: "Location 2",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "resolved",
      relation: "community",
    }).returning()
    reportId2 = r2.id
  })

  afterAll(async () => {
    if (reportId1) await db.delete(reports).where(eq(reports.id, reportId1)).catch(() => {})
    if (reportId2) await db.delete(reports).where(eq(reports.id, reportId2)).catch(() => {})
    if (userId) await db.delete(publics).where(eq(publics.id, userId)).catch(() => {})
  })

  test("filters reports by status", async () => {
    const res = await testRequest(app, "GET", "/api/profile/reports?status=pending", { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    for (const item of json.data) {
      expect(item.status).toBe("pending")
    }
  })

  test("filters reports by resolved status", async () => {
    const res = await testRequest(app, "GET", "/api/profile/reports?status=resolved", { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    for (const item of json.data) {
      expect(item.status).toBe("resolved")
    }
  })

  test("paginates reports", async () => {
    const res = await testRequest(app, "GET", "/api/profile/reports?page=1&limit=1", { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBeLessThanOrEqual(1)
    expect(json.pagination).toBeDefined()
    expect(json.pagination.total).toBeGreaterThanOrEqual(2)
  })

  test("returns page 2", async () => {
    const res = await testRequest(app, "GET", "/api/profile/reports?page=2&limit=1", { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.length).toBeLessThanOrEqual(1)
  })
})

describe("Profile Coverage - Update Profile", () => {
  let userId: string
  let userToken: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")
    const [user] = await db.insert(publics).values({
      email: `update-prof-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Update Prof User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    userId = user.id
    userToken = await signToken({ sub: user.id, email: user.email, type: "user" })
  })

  afterAll(async () => {
    if (userId) await db.delete(publics).where(eq(publics.id, userId)).catch(() => {})
  })

  test("updates name only", async () => {
    const res = await testRequest(app, "PATCH", "/api/profile", {
      token: userToken,
      body: { name: "New Name Only" },
    })
    expect(res.status).toBe(200)
  })

  test("updates phone with valid format", async () => {
    const res = await testRequest(app, "PATCH", "/api/profile", {
      token: userToken,
      body: { phone: `08${randomBytes(4).toString("hex").slice(0, 8)}` },
    })
    expect([200, 400]).toContain(res.status)
  })
})

describe("Profile Coverage - Phone/Email Uniqueness", () => {
  let user1Id: string
  let user1Token: string
  let user2Id: string
  let user2Phone: string
  let user2Email: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")
    const suffix1 = String(Date.now()).slice(-7)
    const suffix2 = String(Date.now() + 1).slice(-7)

    const [user1] = await db.insert(publics).values({
      email: `uniq1-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Uniqueness User 1",
      phone: `+62812${suffix1}`,
    }).returning()
    user1Id = user1.id
    user1Token = await signToken({ sub: user1.id, email: user1.email, type: "user" })

    user2Email = `uniq2-${randomBytes(4).toString("hex")}@example.com`
    user2Phone = `+62813${suffix2}`
    const [user2] = await db.insert(publics).values({
      email: user2Email,
      password: hashedPassword,
      name: "Uniqueness User 2",
      phone: user2Phone,
    }).returning()
    user2Id = user2.id
  })

  afterAll(async () => {
    if (user1Id) await db.delete(publics).where(eq(publics.id, user1Id)).catch(() => {})
    if (user2Id) await db.delete(publics).where(eq(publics.id, user2Id)).catch(() => {})
  })

  test("rejects phone already in use", async () => {
    const res = await testRequest(app, "PATCH", "/api/profile", {
      token: user1Token,
      body: { phone: user2Phone },
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Phone")
  })

  test("rejects email already in use", async () => {
    const res = await testRequest(app, "PATCH", "/api/profile", {
      token: user1Token,
      body: { email: user2Email },
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Email")
  })
})

describe("Profile Coverage - Google User Change Password", () => {
  let googleUserId: string
  let googleUserToken: string

  beforeAll(async () => {
    const [user] = await db.insert(publics).values({
      email: `google-chpw-${randomBytes(4).toString("hex")}@example.com`,
      name: "Google Change PW",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
      signupMethod: "google",
      googleId: `google-chpw-${randomBytes(8).toString("hex")}`,
    }).returning()
    googleUserId = user.id
    googleUserToken = await signToken({ sub: user.id, email: user.email, type: "user" })
  })

  afterAll(async () => {
    if (googleUserId) await db.delete(publics).where(eq(publics.id, googleUserId)).catch(() => {})
  })

  test("rejects change password for Google user without password", async () => {
    const res = await testRequest(app, "PUT", "/api/profile/password", {
      token: googleUserToken,
      body: {
        currentPassword: "AnyPass123",
        newPassword: "NewPass123",
        confirmPassword: "NewPass123",
      },
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("Google")
  })
})

describe("Profile Coverage - Report Detail With History", () => {
  let userId: string
  let userToken: string
  let reportId: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")
    const [user] = await db.insert(publics).values({
      email: `rpt-detail-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Report Detail User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    userId = user.id
    userToken = await signToken({ sub: user.id, email: user.email, type: "user" })

    const [r] = await db.insert(reports).values({
      publicId: user.id,
      category: "poisoning",
      title: "Detail Test Report",
      description: "Report detail test with status history mapping for coverage",
      location: "Detail Location",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "parent",
    }).returning()
    reportId = r.id

    // Create status history directly
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      await db.insert(reportStatusHistory).values({
        reportId: r.id,
        fromStatus: "pending",
        toStatus: "analyzing",
        changedBy: adminUser.id,
        notes: "Under review",
      })
    }
  })

  afterAll(async () => {
    if (reportId) {
      await db.delete(reportStatusHistory).where(eq(reportStatusHistory.reportId, reportId)).catch(() => {})
      await db.delete(reports).where(eq(reports.id, reportId)).catch(() => {})
    }
    if (userId) await db.delete(publics).where(eq(publics.id, userId)).catch(() => {})
  })

  test("returns report detail with status history", async () => {
    const res = await testRequest(app, "GET", `/api/profile/reports/${reportId}`, { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.statusHistory).toBeDefined()
    expect(Array.isArray(json.data.statusHistory)).toBe(true)
    if (json.data.statusHistory.length > 0) {
      const entry = json.data.statusHistory[0]
      expect(entry.id).toBeDefined()
      expect(entry.fromStatus).toBeDefined()
      expect(entry.toStatus).toBeDefined()
      expect(entry.changedBy).toBeDefined()
    }
  })
})
