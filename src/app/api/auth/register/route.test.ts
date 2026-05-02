/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "@/app/api/auth/register/route"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

// Mock dependencies
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userProgress: {
      create: vi.fn(),
    },
    userSettings: {
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
  })),
}))

import { hash } from "bcryptjs"
import { db } from "@/lib/db"

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

describe("api/auth/register/route", () => {
  it("should register new user successfully", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    const mockUser: User = {
      id: "user-123",
      email: mockBody.email,
      name: mockBody.name,
      role: "USER",
    }

    vi.mocked(hash).mockResolvedValue("hashedPassword")
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue(mockUser)
    vi.mocked(db.userProgress.create).mockResolvedValue({ id: "progress-1", userId: mockUser.id, topic: "general", completedCount: 0, lastCompleted: null })
    vi.mocked(db.userSettings.create).mockResolvedValue({ id: "settings-1", userId: mockUser.id, theme: "system", language: "ru" })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe("Пользователь успешно зарегистрирован")
    expect(data.user.email).toBe("test@example.com")
    expect(hash).toHaveBeenCalledWith("password123", 12)
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: "USER",
      },
    })
  })

  it("should register user with default name", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
    }

    const mockUser: User = {
      id: "user-123",
      email: mockBody.email,
      name: null,
      role: "USER",
    }

    vi.mocked(hash).mockResolvedValue("hashedPassword")
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(db.user.create).mockResolvedValue(mockUser)
    vi.mocked(db.userProgress.create).mockResolvedValue({ id: "progress-1", userId: mockUser.id, topic: "general", completedCount: 0, lastCompleted: null })
    vi.mocked(db.userSettings.create).mockResolvedValue({ id: "settings-1", userId: mockUser.id, theme: "system", language: "ru" })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: null }),
      })
    )
  })

  it("should return 409 if user already exists", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
      name: "Existing User",
      role: "USER",
    })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe("Пользователь с таким email уже существует")
  })

  it("should return 400 for invalid email", async () => {
    const mockBody = {
      email: "invalid-email",
      password: "password123",
      name: "Test User",
    }

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("Некорректный email")
  })

  it("should return 400 for short password", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "short",
      name: "Test User",
    }

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("минимум 8 символов")
  })

  it("should return 400 for short name", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "A",
    }

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("минимум 2 символа")
  })

  it("should handle database errors", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    vi.mocked(db.user.findUnique).mockRejectedValue(new Error("Database error"))

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe("Ошибка при регистрации")
  })

  it("should handle hash errors", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    vi.mocked(hash).mockRejectedValue(new Error("Hash error"))

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe("Ошибка при регистрации")
  })
})
