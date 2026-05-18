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
    userProgress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
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

const { GET, POST } = await import("@/app/api/visualizations/progress/route")

describe("api/visualizations/progress/route", () => {
  describe("GET", () => {
    it("should return progress for authenticated user", async () => {
      const mockProgress = [
        {
          id: "1",
          userId: mockUserId,
          topic: "quantum",
          completedCount: 5,
          lastCompleted: new Date(),
        },
        {
          id: "2",
          userId: mockUserId,
          topic: "cosmos",
          completedCount: 3,
          lastCompleted: new Date(),
        },
      ]

      const findManyMock = vi.mocked(db.userProgress.findMany)
      findManyMock.mockResolvedValue(mockProgress)

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].topic).toBe("quantum")
      expect(data.data[0].completedCount).toBe(5)
      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { lastCompleted: "desc" },
        select: { id: true, topic: true, completedCount: true, lastCompleted: true },
      })
    })

    it("should return empty array when no progress", async () => {
      vi.mocked(db.userProgress.findMany).mockResolvedValue([])

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
      vi.mocked(db.userProgress.findMany).mockRejectedValue(new Error("Database error"))

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to fetch progress")
    })
  })

  describe("POST", () => {
    it("should create new progress", async () => {
      const mockBody = { topic: "quantum", completedCount: 1 }

      const mockProgress = {
        id: "1",
        userId: mockUserId,
        ...mockBody,
        lastCompleted: new Date(),
      }

      const upsertMock = vi.mocked(db.userProgress.upsert)
      upsertMock.mockResolvedValue(mockProgress)

      const request = new NextRequest("http://localhost/api/visualizations/progress", {
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
      expect(data.data.completedCount).toBe(1)
      expect(upsertMock).toHaveBeenCalled()
    })

    it("should increment existing progress", async () => {
      const mockBody = { topic: "quantum", completedCount: 2 }

      const existing = {
        id: "1",
        userId: mockUserId,
        topic: "quantum",
        completedCount: 5,
        lastCompleted: new Date(),
      }

      const updated = {
        ...existing,
        completedCount: 7,
      }

      const upsertMock = vi.mocked(db.userProgress.upsert)
      upsertMock.mockResolvedValue(updated)

      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.completedCount).toBe(7)
    })

    it("should use default completedCount when not provided", async () => {
      const mockBody = { topic: "quantum" }

      const mockProgress = {
        id: "1",
        userId: mockUserId,
        topic: "quantum",
        completedCount: 1,
        lastCompleted: new Date(),
      }

      const upsertMock = vi.mocked(db.userProgress.upsert)
      upsertMock.mockResolvedValue(mockProgress)

      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.completedCount).toBe(1)
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it("should return 400 for invalid topic", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "", completedCount: 1 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should return 400 for negative completedCount", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", completedCount: -1 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should return 400 for completedCount exceeding max", async () => {
      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", completedCount: 1001 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should handle database errors", async () => {
      vi.mocked(db.userProgress.upsert).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/visualizations/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "quantum", completedCount: 1 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to update progress")
    })
  })
})
