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
    userActivity: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
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

const { GET, POST } = await import("@/app/api/activity/route")

describe("api/activity/route", () => {
  describe("GET", () => {
    it("should return activity history for authenticated user", async () => {
      const mockActivities = [
        {
          id: "1",
          action: "completed_visualization",
          topic: "quantum",
          xpGained: 50,
          createdAt: new Date(),
        },
      ]

      const findManyMock = vi.mocked(db.userActivity.findMany)
      findManyMock.mockResolvedValue(mockActivities)
      vi.mocked(db.userActivity.count).mockResolvedValue(1)

      const request = new NextRequest("http://localhost/api/activity")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].action).toBe("completed_visualization")
      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: "desc" },
        take: 50,
        skip: 0,
        select: {
          id: true,
          action: true,
          topic: true,
          xpGained: true,
          createdAt: true,
        },
      })
    })

    it("should support limit and offset query params", async () => {
      const findManyMock = vi.mocked(db.userActivity.findMany)
      findManyMock.mockResolvedValue([])
      vi.mocked(db.userActivity.count).mockResolvedValue(0)

      const request = new NextRequest("http://localhost/api/activity?limit=10&offset=5")
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        })
      )
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/activity")
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: "Unauthorized" })
    })

    it("should handle database errors", async () => {
      const findManyMock = vi.mocked(db.userActivity.findMany)
      findManyMock.mockRejectedValue(new Error("Database error"))
      vi.mocked(db.userActivity.count).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/activity")
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to fetch activities")
    })
  })

  describe("POST", () => {
    it("should create new activity record", async () => {
      const mockBody = {
        action: "completed_visualization",
        topic: "quantum",
        xpGained: 50,
      }

      const created = {
        id: "1",
        ...mockBody,
        createdAt: new Date(),
      }

      const createMock = vi.mocked(db.userActivity.create)
      createMock.mockResolvedValue(created)

      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.id).toBe("1")
      expect(data.data.action).toBe("completed_visualization")
      expect(createMock).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          action: "completed_visualization",
          topic: "quantum",
          xpGained: 50,
        },
        select: {
          id: true,
          action: true,
          topic: true,
          xpGained: true,
          createdAt: true,
        },
      })
    })

    it("should create activity with default xpGained", async () => {
      const mockBody = { action: "viewed_page" }

      const created = {
        id: "1",
        action: "viewed_page",
        topic: null,
        xpGained: 0,
        createdAt: new Date(),
      }

      const createMock = vi.mocked(db.userActivity.create)
      createMock.mockResolvedValue(created)

      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.xpGained).toBe(0)
    })

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it("should return 400 for invalid action", async () => {
      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "", xpGained: 100 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })

    it("should return 400 for negative xpGained", async () => {
      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", xpGained: -10 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it("should handle database errors", async () => {
      const createMock = vi.mocked(db.userActivity.create)
      createMock.mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Failed to log activity")
    })
  })
})
