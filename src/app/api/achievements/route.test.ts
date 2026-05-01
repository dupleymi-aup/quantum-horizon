/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/achievements/route"

interface Achievement {
  id: string
  userId: string
  achievementId: string
  progress: number
  target: number
  unlockedAt: Date | null
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
    userAchievement: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
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

describe("api/achievements/route", () => {
  describe("GET", () => {
    it("should return achievements for authenticated user", async () => {
      const mockDate = new Date()
      const mockAchievements: Achievement[] = [
        {
          id: "1",
          userId: mockUserId,
          achievementId: "first_login",
          progress: 100,
          target: 100,
          unlockedAt: mockDate,
        },
      ]

      const findManyMock = vi.mocked(db.userAchievement.findMany)
      findManyMock.mockResolvedValue(mockAchievements)

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].achievementId).toBe("first_login")
      expect(findManyMock).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { unlockedAt: "desc" },
        select: {
          id: true,
          achievementId: true,
          progress: true,
          target: true,
          unlockedAt: true,
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
      const findManyMock = vi.mocked(db.userAchievement.findMany)
      findManyMock.mockRejectedValue(new Error("Database error"))

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toEqual({ error: "Failed to fetch achievements" })
    })
  })

  describe("POST", () => {
    it("should create new achievement", async () => {
      const mockBody = {
        achievementId: "first_login",
        progress: 50,
        target: 100,
      }

      const mockDate = new Date()
      const mockCreated: Achievement = {
        id: "1",
        userId: mockUserId,
        ...mockBody,
        unlockedAt: mockDate,
      }

      const findUniqueMock = vi.mocked(db.userAchievement.findUnique)
      const createMock = vi.mocked(db.userAchievement.create)

      findUniqueMock.mockResolvedValue(null)
      createMock.mockResolvedValue(mockCreated)

      const request = new NextRequest("http://localhost/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.newlyUnlocked).toBe(false)
      expect(createMock).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          achievementId: "first_login",
          progress: 50,
          target: 100,
        },
      })
    })

    it("should update existing achievement", async () => {
      const mockBody = {
        achievementId: "first_login",
        progress: 30,
        target: 100,
      }

      const existing: Achievement = {
        id: "1",
        userId: mockUserId,
        achievementId: "first_login",
        progress: 20,
        target: 100,
        unlockedAt: null,
      }

      const updated: Achievement = {
        ...existing,
        progress: 50,
      }

      const findUniqueMock = vi.mocked(db.userAchievement.findUnique)
      const updateMock = vi.mocked(db.userAchievement.update)

      findUniqueMock.mockResolvedValue(existing)
      updateMock.mockResolvedValue(updated)

      const request = new NextRequest("http://localhost/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.newlyUnlocked).toBe(false)
      expect(updateMock).toHaveBeenCalled()
    })

    it("should return 401 for unauthenticated user", async () => {
      const getSessionMock = vi.mocked(getServerSession)
      getSessionMock.mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId: "test" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it("should return 400 for invalid input", async () => {
      const request = new NextRequest("http://localhost/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId: "", progress: -1 }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Invalid input")
    })
  })
})
