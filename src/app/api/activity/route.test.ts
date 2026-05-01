/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/activity/route"

interface Activity {
  id: string
  action: string
  topic: string | null
  xpGained: number
  createdAt: string
}

// Mock dependencies
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
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
  })),
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

describe("api/activity/route", () => {
  describe("GET", () => {
    it("should return activity history for authenticated user", async () => {
      const mockDate = new Date()
      const mockActivities: Activity[] = [
        {
          id: "1",
          action: "completed_visualization",
          topic: "quantum",
          xpGained: 50,
          createdAt: mockDate.toISOString(),
        },
      ]

      const findManyMock = vi.mocked(db.userActivity.findMany)
      findManyMock.mockResolvedValue(mockActivities)

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].action).toBe("completed_visualization")
      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          action: true,
          topic: true,
          xpGained: true,
          createdAt: true,
        },
      })
    })

    it("should return 401 for unauthenticated user", async () => {
      const getSessionMock = vi.mocked(getServerSession)
      getSessionMock.mockResolvedValue(null)

      const response = await GET()

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data).toEqual({ error: "Unauthorized" })
    })

    it("should handle database errors", async () => {
      const findManyMock = vi.mocked(db.userActivity.findMany)
      findManyMock.mockRejectedValue(new Error("Database error"))

      const response = await GET()

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

      const mockDate = new Date()
      const createdActivity: Activity = {
        id: "1",
        ...mockBody,
        createdAt: mockDate.toISOString(),
      }

      const createMock = vi.mocked(db.userActivity.create)
      createMock.mockResolvedValue(createdActivity)

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
      const mockBody = {
        action: "viewed_page",
      }

      const mockDate = new Date()
      const createdActivity: Activity = {
        id: "1",
        action: "viewed_page",
        topic: null,
        xpGained: 0,
        createdAt: mockDate.toISOString(),
      }

      const createMock = vi.mocked(db.userActivity.create)
      createMock.mockResolvedValue(createdActivity)

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
      const getSessionMock = vi.mocked(getServerSession)
      getSessionMock.mockResolvedValue(null)

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
