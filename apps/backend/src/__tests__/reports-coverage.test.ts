import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { Hono } from "hono"
import reports from "../routes/reports"
import { createTestApp, testRequest } from "./setup"
import { db } from "../db"
import { publics, reports as reportsTable, reportFiles } from "../db/schema"
import { eq } from "drizzle-orm"
import { randomBytes } from "crypto"
import { signToken } from "../lib/jwt"
import { hashPassword } from "../lib/password"

const app = createTestApp(new Hono().route("/reports", reports))

const JPEG_HEADER = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])

describe("Reports Coverage - User Reports", () => {
  let userId: string
  let userToken: string
  let reportId: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")
    const [user] = await db.insert(publics).values({
      email: `rpt-cov-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "Report Coverage User",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    userId = user.id
    userToken = await signToken({ sub: user.id, email: user.email, type: "user" })

    const [r] = await db.insert(reportsTable).values({
      publicId: user.id,
      category: "poisoning",
      title: "File Upload Test Report",
      description: "This is a test report for file upload coverage testing purposes that is long enough",
      location: "Test Location",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "parent",
    }).returning()
    reportId = r.id
  })

  afterAll(async () => {
    if (reportId) {
      await db.delete(reportFiles).where(eq(reportFiles.reportId, reportId)).catch(() => {})
      await db.delete(reportsTable).where(eq(reportsTable.id, reportId)).catch(() => {})
    }
    if (userId) await db.delete(publics).where(eq(publics.id, userId)).catch(() => {})
  })

  test("lists user reports (my/reports)", async () => {
    const res = await testRequest(app, "GET", "/api/reports/my/reports", { token: userToken })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.pagination).toBeDefined()
  })

  test("paginates user reports", async () => {
    const res = await testRequest(app, "GET", "/api/reports/my/reports?page=1&limit=5", { token: userToken })
    expect(res.status).toBe(200)
  })

  test("uploads file to own report", async () => {
    if (!reportId) return
    const fileData = new Uint8Array([...JPEG_HEADER, ...new Uint8Array(100)])
    const file = new File([fileData], "test.jpg", { type: "image/jpeg" })
    const formData = new FormData()
    formData.append("files", file)

    const res = await testRequest(app, "POST", `/api/reports/${reportId}/files`, {
      token: userToken,
      formData,
    })
    expect(res.status).toBe(201)
  })

  test("returns 404 for file upload to non-existent report", async () => {
    const fileData = new Uint8Array([...JPEG_HEADER, ...new Uint8Array(100)])
    const file = new File([fileData], "test.jpg", { type: "image/jpeg" })
    const formData = new FormData()
    formData.append("files", file)

    const res = await testRequest(app, "POST", "/api/reports/00000000-0000-0000-0000-000000000000/files", {
      token: userToken,
      formData,
    })
    expect(res.status).toBe(404)
  })

  test("rejects upload without files", async () => {
    if (!reportId) return
    const formData = new FormData()

    const res = await testRequest(app, "POST", `/api/reports/${reportId}/files`, {
      token: userToken,
      formData,
    })
    expect(res.status).toBe(400)
  })

  test("returns 404 for deleting file from non-existent report", async () => {
    const res = await testRequest(app, "DELETE", "/api/reports/00000000-0000-0000-0000-000000000000/files/00000000-0000-0000-0000-000000000000", {
      token: userToken,
    })
    expect(res.status).toBe(404)
  })
})

describe("Reports Coverage - Access Control", () => {
  let user1Token: string
  let user2Token: string
  let user1Id: string
  let user2Id: string
  let reportId: string

  beforeAll(async () => {
    const hashedPassword = await hashPassword("Test1234")

    const [user1] = await db.insert(publics).values({
      email: `rpt-acl1-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "ACL User 1",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    user1Id = user1.id
    user1Token = await signToken({ sub: user1.id, email: user1.email, type: "user" })

    const [user2] = await db.insert(publics).values({
      email: `rpt-acl2-${randomBytes(4).toString("hex")}@example.com`,
      password: hashedPassword,
      name: "ACL User 2",
      phone: `+62812${randomBytes(4).toString("hex").slice(0, 7)}`,
    }).returning()
    user2Id = user2.id
    user2Token = await signToken({ sub: user2.id, email: user2.email, type: "user" })

    const [r] = await db.insert(reportsTable).values({
      publicId: user1.id,
      category: "quality",
      title: "ACL Test Report",
      description: "This is an ACL test report for verifying access control in file operations",
      location: "ACL Location",
      provinceId: "11",
      cityId: "11.01",
      incidentDate: new Date(),
      status: "pending",
      relation: "teacher",
    }).returning()
    reportId = r.id
  })

  afterAll(async () => {
    if (reportId) await db.delete(reportsTable).where(eq(reportsTable.id, reportId)).catch(() => {})
    if (user1Id) await db.delete(publics).where(eq(publics.id, user1Id)).catch(() => {})
    if (user2Id) await db.delete(publics).where(eq(publics.id, user2Id)).catch(() => {})
  })

  test("denies file upload to other user report", async () => {
    if (!reportId) return
    const fileData = new Uint8Array([...JPEG_HEADER, ...new Uint8Array(100)])
    const file = new File([fileData], "test.jpg", { type: "image/jpeg" })
    const formData = new FormData()
    formData.append("files", file)

    const res = await testRequest(app, "POST", `/api/reports/${reportId}/files`, {
      token: user2Token,
      formData,
    })
    expect(res.status).toBe(403)
  })

  test("denies file delete from other user report", async () => {
    if (!reportId) return
    const res = await testRequest(app, "DELETE", `/api/reports/${reportId}/files/00000000-0000-0000-0000-000000000000`, {
      token: user2Token,
    })
    expect(res.status).toBe(403)
  })
})
