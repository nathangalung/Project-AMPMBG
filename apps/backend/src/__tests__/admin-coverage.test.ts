import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { Hono } from "hono"
import admin from "../routes/admin"
import { createTestApp, testRequest } from "./setup"
import { db } from "../db"
import { publics, reports, admins } from "../db/schema"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { signToken } from "../lib/jwt"
import { hashPassword } from "../lib/password"

const app = createTestApp(new Hono().route("/admin", admin))

describe("Admin Coverage - Bulk Status", () => {
  let adminToken: string
  let reportId1: string
  let reportId2: string
  let testUserId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }

    const hashedPassword = await hashPassword("Test1234")
    const [user] = await db.insert(publics).values({
      email: `bulk-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Bulk Test User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    testUserId = user.id

    const [r1] = await db.insert(reports).values({
      publicId: user.id,
      category: "poisoning",
      title: "Bulk Test Report 1",
      description: "Description for bulk test report number one that is long enough",
      location: "Test Location",
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
      title: "Bulk Test Report 2",
      description: "Description for bulk test report number two that is long enough",
      location: "Test Location 2",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "community",
    }).returning()
    reportId2 = r2.id
  })

  afterAll(async () => {
    if (reportId1) await db.delete(reports).where(eq(reports.id, reportId1)).catch(() => {})
    if (reportId2) await db.delete(reports).where(eq(reports.id, reportId2)).catch(() => {})
    if (testUserId) await db.delete(publics).where(eq(publics.id, testUserId)).catch(() => {})
  })

  test("bulk updates report status", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/bulk-status", {
      token: adminToken,
      body: { reportIds: [reportId1, reportId2], status: "analyzing" },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.updated).toBe(2)
  })

  test("bulk update with notes", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/bulk-status", {
      token: adminToken,
      body: { reportIds: [reportId1], status: "in_progress", notes: "Investigating now" },
    })
    expect(res.status).toBe(200)
  })

  test("bulk update to resolved", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/bulk-status", {
      token: adminToken,
      body: { reportIds: [reportId1, reportId2], status: "resolved" },
    })
    expect(res.status).toBe(200)
  })

  test("bulk update from resolved to pending", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/bulk-status", {
      token: adminToken,
      body: { reportIds: [reportId1], status: "pending" },
    })
    expect(res.status).toBe(200)
  })

  test("returns 404 for non-existent reports", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/bulk-status", {
      token: adminToken,
      body: {
        reportIds: ["00000000-0000-0000-0000-000000000000"],
        status: "analyzing",
      },
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - Delete Report", () => {
  let adminToken: string
  let deleteReportId: string
  let deleteUserId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }

    const [user] = await db.insert(publics).values({
      email: `del-report-${randomBytes(4).toString("hex")}@example.com`,
      name: "Delete Report User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    deleteUserId = user.id

    const [report] = await db.insert(reports).values({
      publicId: user.id,
      category: "poisoning",
      title: "Report To Delete",
      description: "Description for report to delete that is long enough for validation",
      location: "Delete Location",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "parent",
    }).returning()
    deleteReportId = report.id
  })

  afterAll(async () => {
    if (deleteReportId) await db.delete(reports).where(eq(reports.id, deleteReportId)).catch(() => {})
    if (deleteUserId) await db.delete(publics).where(eq(publics.id, deleteUserId)).catch(() => {})
  })

  test("returns 404 for non-existent report", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "DELETE", "/api/admin/reports/00000000-0000-0000-0000-000000000000", {
      token: adminToken,
    })
    expect(res.status).toBe(404)
  })

  test("deletes report successfully", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "DELETE", `/api/admin/reports/${deleteReportId}`, {
      token: adminToken,
    })
    expect(res.status).toBe(200)
    deleteReportId = ""
  })
})

describe("Admin Coverage - Analytics", () => {
  let adminToken: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  test("returns analytics with default params", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/analytics", { token: adminToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.overview).toBeDefined()
    expect(json.trends).toBeDefined()
  })

  test("returns analytics with year param", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/analytics?year=2025", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("returns analytics with year and month", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/analytics?year=2025&month=6", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("returns analytics for current month", async () => {
    if (!adminToken) return
    const now = new Date()
    const res = await testRequest(app, "GET", `/api/admin/analytics?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
      token: adminToken,
    })
    expect(res.status).toBe(200)
  })
})

describe("Admin Coverage - Report Status Update", () => {
  let adminToken: string
  let reportId: string
  let testUserId: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }

    const [user] = await db.insert(publics).values({
      email: `status-${randomBytes(4).toString("hex")}@example.com`,
      name: "Status Test User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    testUserId = user.id

    const [report] = await db.insert(reports).values({
      publicId: user.id,
      category: "poisoning",
      title: "Status Update Report",
      description: "Description for status update report that is long enough for validation",
      location: "Status Location",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "parent",
    }).returning()
    reportId = report.id
  })

  afterAll(async () => {
    if (reportId) await db.delete(reports).where(eq(reports.id, reportId)).catch(() => {})
    if (testUserId) await db.delete(publics).where(eq(publics.id, testUserId)).catch(() => {})
  })

  test("updates pending to analyzing", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", `/api/admin/reports/${reportId}/status`, {
      token: adminToken,
      body: { status: "analyzing" },
    })
    expect(res.status).toBe(200)
  })

  test("updates with notes and credibility", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", `/api/admin/reports/${reportId}/status`, {
      token: adminToken,
      body: { status: "in_progress", notes: "Test note", credibilityLevel: "high" },
    })
    expect(res.status).toBe(200)
  })

  test("updates to resolved", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", `/api/admin/reports/${reportId}/status`, {
      token: adminToken,
      body: { status: "resolved" },
    })
    expect(res.status).toBe(200)
  })

  test("reverts from resolved", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", `/api/admin/reports/${reportId}/status`, {
      token: adminToken,
      body: { status: "analyzing" },
    })
    expect(res.status).toBe(200)
  })

  test("returns 404 for non-existent report", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "PATCH", "/api/admin/reports/00000000-0000-0000-0000-000000000000/status", {
      token: adminToken,
      body: { status: "analyzing" },
    })
    expect(res.status).toBe(404)
  })
})

describe("Admin Coverage - User Filters", () => {
  let adminToken: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  test("filters users by search", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/users?search=test", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters users by signup method", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/users?signupMethod=manual", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("paginates users", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/users?page=1&limit=5", { token: adminToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.pagination).toBeDefined()
  })
})

describe("Admin Coverage - Report Filters", () => {
  let adminToken: string

  beforeAll(async () => {
    const adminUser = await db.query.admins.findFirst({
      where: eq(admins.email, "admin@ampmbg.id"),
    })
    if (adminUser) {
      adminToken = await signToken({ sub: adminUser.id, email: adminUser.email, type: "admin" })
    }
  })

  test("filters reports by search", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports?search=test", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters reports by status", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports?status=pending", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters reports by category", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports?category=poisoning", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters reports by province", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports?provinceId=11", { token: adminToken })
    expect(res.status).toBe(200)
  })

  test("filters reports by date range", async () => {
    if (!adminToken) return
    const res = await testRequest(app, "GET", "/api/admin/reports?startDate=2024-01-01&endDate=2026-12-31", {
      token: adminToken,
    })
    expect(res.status).toBe(200)
  })
})
