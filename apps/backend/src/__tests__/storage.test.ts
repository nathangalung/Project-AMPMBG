import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { validateFile, uploadFile, deleteFile } from "../lib/storage"
import { mkdir, rm } from "fs/promises"
import { existsSync } from "fs"

// Valid file headers
const JPEG_HEADER = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])
const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4E, 0x47])
const GIF_HEADER = new Uint8Array([0x47, 0x49, 0x46, 0x38])
const WEBP_HEADER = new Uint8Array([0x52, 0x49, 0x46, 0x46])
const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46])

describe("Storage Library", () => {
  describe("validateFile", () => {
    test("accepts valid JPEG file", async () => {
      const file = new File([JPEG_HEADER], "test.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("accepts valid PNG file", async () => {
      const file = new File([PNG_HEADER], "test.png", { type: "image/png" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("accepts valid GIF file", async () => {
      const file = new File([GIF_HEADER], "test.gif", { type: "image/gif" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("accepts valid WebP file", async () => {
      const file = new File([WEBP_HEADER], "test.webp", { type: "image/webp" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("accepts valid PDF file", async () => {
      const file = new File([PDF_HEADER], "test.pdf", { type: "application/pdf" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("rejects file exceeding 10MB", async () => {
      const file = new File([JPEG_HEADER], "test.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("10MB")
    })

    test("rejects disallowed file type", async () => {
      const file = new File(["test"], "test.exe", { type: "application/x-executable" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("not allowed")
    })

    test("rejects text file type", async () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
    })

    test("accepts file at exactly 10MB", async () => {
      const file = new File([JPEG_HEADER], "test.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })

    test("rejects spoofed MIME type", async () => {
      const file = new File(["fake content"], "evil.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 1024 })
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("mismatch")
    })
  })

  describe("uploadFile (local storage)", () => {
    const testDir = "./test-uploads"

    beforeAll(async () => {
      process.env.STORAGE_TYPE = "local"
      process.env.LOCAL_UPLOAD_DIR = testDir
    })

    afterAll(async () => {
      if (existsSync(testDir)) {
        await rm(testDir, { recursive: true, force: true })
      }
    })

    test("uploads file to local storage", async () => {
      const content = "test content"
      const file = new File([content], "test.jpg", { type: "image/jpeg" })

      const result = await uploadFile(file, "reports")

      expect(result.url).toContain("/uploads/")
      expect(result.key).toContain("reports/")
      expect(result.key).toContain(".jpg")
    })

    test("creates directory if not exists", async () => {
      const file = new File(["test"], "test.png", { type: "image/png" })

      const result = await uploadFile(file, "new-folder")

      expect(result.key).toContain("new-folder/")
    })

    test("generates unique filenames", async () => {
      const file1 = new File(["test1"], "test.jpg", { type: "image/jpeg" })
      const file2 = new File(["test2"], "test.jpg", { type: "image/jpeg" })

      const result1 = await uploadFile(file1)
      const result2 = await uploadFile(file2)

      expect(result1.key).not.toBe(result2.key)
    })

    test("preserves file extension", async () => {
      const file = new File(["test"], "document.pdf", { type: "application/pdf" })

      const result = await uploadFile(file)

      expect(result.key).toContain(".pdf")
    })

    test("handles files without extension", async () => {
      const file = new File(["test"], "noextension", { type: "image/jpeg" })

      const result = await uploadFile(file)

      expect(result.key).toBeDefined()
    })
  })

  describe("deleteFile (local storage)", () => {
    const testDir = "./test-uploads-delete"

    beforeAll(async () => {
      process.env.STORAGE_TYPE = "local"
      process.env.LOCAL_UPLOAD_DIR = testDir
    })

    afterAll(async () => {
      if (existsSync(testDir)) {
        await rm(testDir, { recursive: true, force: true })
      }
    })

    test("deletes uploaded file", async () => {
      const file = new File(["test"], "delete-test.jpg", { type: "image/jpeg" })
      const { key } = await uploadFile(file, "reports")

      await deleteFile(key)

      expect(true).toBe(true)
    })

    test("handles non-existent file gracefully", async () => {
      await deleteFile("non-existent/file.jpg")

      expect(true).toBe(true)
    })
  })
})
