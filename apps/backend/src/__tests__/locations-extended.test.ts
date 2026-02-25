import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import locations from "../routes/locations"
import { createTestApp, testRequest } from "./setup"

const app = createTestApp(new Hono().route("/locations", locations))

describe("Locations Extended", () => {
  describe("GET /api/locations/lookup", () => {
    test("returns null with no params", async () => {
      const res = await testRequest(app, "GET", "/api/locations/lookup")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeNull()
    })

    test("looks up province by name", async () => {
      const res = await testRequest(app, "GET", "/api/locations/lookup?province=Jawa")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
      expect(json.data.provinceId).toBeDefined()
    })

    test("looks up city by name", async () => {
      const res = await testRequest(app, "GET", "/api/locations/lookup?city=Jakarta")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
    })

    test("looks up city with province", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/lookup?province=Jawa&city=Bandung"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
    })

    test("looks up district with city", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/lookup?province=Jawa&city=Bandung&district=Coblong"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toBeDefined()
    })

    test("returns nulls for non-existent name", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/lookup?province=NonExistent999"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.provinceId).toBeNull()
    })
  })

  describe("GET /api/locations/search", () => {
    test("returns empty for short query", async () => {
      const res = await testRequest(app, "GET", "/api/locations/search?q=a")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toEqual([])
    })

    test("searches all types by default", async () => {
      const res = await testRequest(app, "GET", "/api/locations/search?q=Jawa")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(Array.isArray(json.data)).toBe(true)
    })

    test("filters by province type", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/search?q=Jawa&type=province"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      for (const item of json.data) {
        expect(item.type).toBe("province")
      }
    })

    test("filters by city type", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/search?q=Jakarta&type=city"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      for (const item of json.data) {
        expect(item.type).toBe("city")
      }
    })

    test("filters by district type", async () => {
      const res = await testRequest(
        app, "GET", "/api/locations/search?q=Menteng&type=district"
      )
      expect(res.status).toBe(200)
      const json = await res.json()
      for (const item of json.data) {
        expect(item.type).toBe("district")
      }
    })

    test("limits results to 20", async () => {
      const res = await testRequest(app, "GET", "/api/locations/search?q=an")
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.length).toBeLessThanOrEqual(20)
    })
  })
})
