import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { Hono } from "hono"
import admin from "../routes/admin"
import { createTestApp, testRequest } from "./setup"
import { db } from "../db"
import { admins, publics, sessions, mbgSchedules, members } from "../db/schema"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { signToken } from "../lib/jwt"
import { hashPassword } from "../lib/password"


const app = createTestApp(new Hono().route("/admin", admin))

describe("Admin Coverage - MBG Schedules", () => {
  let adminToken: string
  let scheduleId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  afterAll(async () => {
    if (scheduleId) {
      await db.delete(mbgSchedules).where(eq(mbgSchedules.id, scheduleId)).catch(() => {})
    }
  })

  test("lists MBG schedules", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/mbg-schedules", { token: adminToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.pagination).toBeDefined()
  })

  test("creates MBG schedule", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "POST", "/api/admin/mbg-schedules", {
      token: adminToken,
      body: {
        schoolName: "SD Negeri Test Coverage",
        provinceId: "11",
        cityId: "11.01",
        scheduleDays: "12345",
        startTime: "07:00",
        endTime: "12:00",
      },
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    scheduleId = json.data.id
  })

  test("updates MBG schedule", async () => {
    if (!adminToken || !scheduleId) return
    const res = await testRequest(app, "PATCH", `/api/admin/mbg-schedules/${scheduleId}`, {
      token: adminToken,
      body: { schoolName: "SD Updated Coverage", isActive: false },
    })
    expect(res.status).toBe(200)
  })

  test("returns 404 for updating non-existent schedule", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/mbg-schedules/00000000-0000-0000-0000-000000000000", {
      token: adminToken,
      body: { schoolName: "Nope" },
    })
    expect(res.status).toBe(404)
  })

  test("filters schedules by province", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/mbg-schedules?provinceId=11", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters schedules by search", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/mbg-schedules?search=Coverage", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("deletes MBG schedule", async () => {
    if (!adminToken || !scheduleId) return
    const res = await testRequest(app, "DELETE", `/api/admin/mbg-schedules/${scheduleId}`, {
      token: adminToken,
    })
    expect(res.status).toBe(200)
    scheduleId = ""
  })

  test("returns 404 for deleting non-existent schedule", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "DELETE", "/api/admin/mbg-schedules/00000000-0000-0000-0000-000000000000", {
      token: adminToken,
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - Sessions", () => {
  let adminToken: string
  let testUserId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }

    const [user] = await db.insert(publics).values({
      email: `sess-test-${randomBytes(4).toString("hex")}@example.com`,
      name: "Session Test User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    testUserId = user.id
  })

  afterAll(async () => {
    if (testUserId) {
      await db.delete(sessions).where(eq(sessions.publicId, testUserId)).catch(() => {})
      await db.delete(publics).where(eq(publics.id, testUserId)).catch(() => {})
    }
  })

  test("lists sessions", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/sessions", { token: adminToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.pagination).toBeDefined()
  })

  test("revokes user sessions", async () => {
    if (!adminToken || !testUserId) return
    const res = await testRequest(app, "POST", `/api/admin/sessions/${testUserId}/revoke-all`, {
      token: adminToken,
    })
    expect(res.status).toBe(200)
  })

  test("returns 404 for revoking non-existent user", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "POST", "/api/admin/sessions/00000000-0000-0000-0000-000000000000/revoke-all", {
      token: adminToken,
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - Admin Update", () => {
  let adminToken: string
  let adminId: string
  let testAdminId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
      adminId = adminUser.id
    }

    // Create test admin
    const hashedPassword = await hashPassword("Admin1234")
    const [newAdmin] = await db.insert(admins).values({
      email: `test-admin-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Test Update Admin",
      adminRole: "Validator",
    }).returning()
    testAdminId = newAdmin.id
  })

  afterAll(async () => {
    if (testAdminId) {
      await db.delete(admins).where(eq(admins.id, testAdminId)).catch(() => {})
    }
  })

  test("updates admin role", async () => {
    if (!adminToken || !testAdminId) return
    const res = await testRequest(app, "PATCH", `/api/admin/admins/${testAdminId}`, {
      token: adminToken,
      body: { adminRole: "Super Admin", name: "Updated Admin" },
    })
    expect(res.status).toBe(200)
  })

  test("deactivates other admin", async () => {
    if (!adminToken || !testAdminId) return
    const res = await testRequest(app, "PATCH", `/api/admin/admins/${testAdminId}`, {
      token: adminToken,
      body: { isActive: false },
    })
    expect(res.status).toBe(200)
  })

  test("blocks self-deactivation", async () => {
    if (!adminToken || !adminId) return
    const res = await testRequest(app, "PATCH", `/api/admin/admins/${adminId}`, {
      token: adminToken,
      body: { isActive: false },
    })
    expect(res.status).toBe(400)
  })

  test("returns 404 for non-existent admin", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/admins/00000000-0000-0000-0000-000000000000", {
      token: adminToken,
      body: { name: "Nope" },
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - Members Search", () => {
  let adminToken: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  test("searches members by name", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/members?search=test", { token: adminToken })
    expect(res.status).toBe(200)
  })
})

describe("Admin Coverage - Member Verification", () => {
  let adminToken: string
  let memberId: string
  let memberUserId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }

    const [user] = await db.insert(publics).values({
      email: `verify-member-${randomBytes(4).toString("hex")}@example.com`,
      name: "Verify Member User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    memberUserId = user.id

    const [member] = await db.insert(members).values({
      publicId: user.id,
      memberType: "foundation",
      organizationName: "Verify Test Org",
    }).returning()
    memberId = member.id
  })

  afterAll(async () => {
    if (memberId) await db.delete(members).where(eq(members.id, memberId)).catch(() => {})
    if (memberUserId) await db.delete(publics).where(eq(publics.id, memberUserId)).catch(() => {})
  })

  test("verifies member (sets verifiedAt/By)", async () => {
    if (!adminToken || !memberId) return
    const res = await testRequest(app, "PATCH", `/api/admin/members/${memberId}/status`, {
      token: adminToken,
      body: { isVerified: true },
    })
    expect(res.status).toBe(200)
  })

  test("unverifies member", async () => {
    if (!adminToken || !memberId) return
    const res = await testRequest(app, "PATCH", `/api/admin/members/${memberId}/status`, {
      token: adminToken,
      body: { isVerified: false },
    })
    expect(res.status).toBe(200)
  })

  test("returns 404 for non-existent member", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/members/00000000-0000-0000-0000-000000000000/status", {
      token: adminToken,
      body: { isVerified: true },
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - Report Scoring", () => {
  let adminToken: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  test("returns 404 for non-existent report scoring", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports/00000000-0000-0000-0000-000000000000/scoring", {
      token: adminToken,
    })
    expect(res.status).toBe(404)
  })
})
