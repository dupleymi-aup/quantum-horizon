/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}))

vi.mock("@/lib/db", () => ({
  db: {
    bookmark: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
}))

vi.mock("@/lib/csrf", () => ({
  withCsrf: (handler: (...args: unknown[]) => unknown) => handler,
}))

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (handler: (...args: unknown[]) => unknown) => handler,
}))

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

const mockUserId = "test-user-123"

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: mockUserId, email: "test@example.com" },
  })
})

afterEach(() => {
  vi.resetAllMocks()
})

const { GET, POST, DELETE } = await import("@/app/api/visualizations/bookmarks/route")

describe("api/visualizations/bookmarks/route", () => {
  describe("GET", () => {
    it("should return bookmarks for authenticated user", async () => {
      const mockBookmarks = [
        {
          id: "1",
          userId: mockUserId,
          topic: "quantum",
          title: "Wave Function",
          createdAt: new Date(),
        },
        {
          id: "2",
          userId: mockUserId,
          topic: "cosmos",
          title: "Black Hole",
          createdAt: new Date(),
        },
      ]

      const findManyMock = vi.mocked(db.bookmark.findMany)
      findManyMock.mockResolvedValue(mockBookmarks)

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].topic).toBe("quantum")
      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: "desc" },
        select: { id: true, topic: true, title: true, createdAt: true },
      })
    })

    it("should return empty array when no bookmarks", async () => {
      vi.mocked(db.bookmark.findMany).mockResolvedValue([])

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const response = await GET()

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: "Unauthorized" })
    })

    it("should handle database errors", async () => {
      vi.mocked(db.bookmark.findMany).mockRejectedValue(new Error("Database error"))

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to fetch bookmarks")
    })
  })

  describe("POST", () => {
    it("should create new bookmark", async () => {
      const mockBody = { topic: "quantum", title: "Wave Function" }

      const created = {
        id: "1",
        userId: mockUserId,
        ...mockBody,
        createdAt: new Date(),
      }

      const findFirstMock = vi.mocked(db.bookmark.findFirst)
      const createMock = vi.mocked(db.bookmark.create)

      findFirstMock.mockResolvedValue(null)
      createMock.mockResolvedValue(created)

      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.id).toBe("1")
      expect(data.data.topic).toBe("quantum")
      expect(createMock).toHaveBeenCalledWith({
        data: { userId: mockUserId, topic: "quantum", title: "Wave Function" },
        select: { id: true, topic: true, title: true, createdAt: true },
      })
    })

    it("should return 409 when bookmark already exists", async () => {
      const mockBody = { topic: "quantum", title: "Wave Function" }

      vi.mocked(db.bookmark.findFirst).mockResolvedValue({
        id: "1",
        userId: mockUserId,
        ...mockBody,
        createdAt: new Date(),
      })

      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe("Bookmark already exists")
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", title: "Test" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it("should return 400 for invalid topic", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "", title: "Test" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should return 400 for invalid title", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", title: "" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should handle database errors", async () => {
      vi.mocked(db.bookmark.findFirst).mockResolvedValue(null)
      vi.mocked(db.bookmark.create).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", title: "Wave Function" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to create bookmark")
    })
  })

  describe("DELETE", () => {
    it("should delete bookmark by topic", async () => {
      const deleteManyMock = vi.mocked(db.bookmark.deleteMany)
      deleteManyMock.mockResolvedValue({ count: 1 })

      const request = new NextRequest(
        "http://localhost/api/visualizations/bookmarks?topic=quantum",
        {
          method: "DELETE",
        }
      )

      const response = await DELETE(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe("Bookmark deleted")
      expect(deleteManyMock).toHaveBeenCalledWith({
        where: { topic: "quantum", userId: mockUserId },
      })
    })

    it("should return 400 when topic is missing", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/bookmarks", {
        method: "DELETE",
      })

      const response = await DELETE(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Topic is required")
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest(
        "http://localhost/api/visualizations/bookmarks?topic=quantum",
        {
          method: "DELETE",
        }
      )

      const response = await DELETE(request)

      expect(response.status).toBe(401)
    })

    it("should handle database errors", async () => {
      vi.mocked(db.bookmark.deleteMany).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest(
        "http://localhost/api/visualizations/bookmarks?topic=quantum",
        {
          method: "DELETE",
        }
      )

      const response = await DELETE(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to delete bookmark")
    })
  })
})
