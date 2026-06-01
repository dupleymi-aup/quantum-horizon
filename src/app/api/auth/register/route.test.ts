/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

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
    info: vi.fn(),
    warn: vi.fn(),
  })),
}))

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn(() => Promise.resolve({ success: true, messageId: "mock-123" })),
}))

// Pass-through mocks for rate limiting and CSRF
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi.fn((handler: unknown) => handler),
}))

vi.mock("@/lib/csrf", () => ({
  withCsrf: vi.fn((handler: unknown) => handler),
}))

import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

const { POST } = await import("@/app/api/auth/register/route")

describe("api/auth/register/route", () => {
  it("should register new user successfully", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    const mockUser = {
      id: "user-123",
      email: mockBody.email,
      name: mockBody.name,
      password: "hashedPassword",
      role: "USER" as const,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(hash).mockResolvedValueOnce("hashedPassword")
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(db.user.create).mockResolvedValueOnce(mockUser)
    vi.mocked(db.userProgress.create).mockResolvedValueOnce({
      id: "progress-1",
      userId: mockUser.id,
      topic: "general",
      completedCount: 0,
      lastCompleted: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.userSettings.create).mockResolvedValueOnce({
      id: "settings-1",
      userId: mockUser.id,
      theme: "system",
      language: "ru",
      fontSize: "normal",
      reduceMotion: false,
      highContrast: false,
      showAnimations: true,
      soundEnabled: false,
      volume: 50,
      autoSave: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const mockBody = { email: "test@example.com", password: "password123" }

    const mockUser = {
      id: "user-123",
      email: mockBody.email,
      name: null,
      password: "hashedPassword",
      role: "USER" as const,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(hash).mockResolvedValueOnce("hashedPassword")
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(db.user.create).mockResolvedValueOnce(mockUser)
    vi.mocked(db.userProgress.create).mockResolvedValueOnce({
      id: "progress-1",
      userId: mockUser.id,
      topic: "general",
      completedCount: 0,
      lastCompleted: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.userSettings.create).mockResolvedValueOnce({
      id: "settings-1",
      userId: mockUser.id,
      theme: "system",
      language: "ru",
      fontSize: "normal",
      reduceMotion: false,
      highContrast: false,
      showAnimations: true,
      soundEnabled: false,
      volume: 50,
      autoSave: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it("should return 409 if user already exists", async () => {
    const mockBody = { email: "test@example.com", password: "password123", name: "Test User" }

    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: "existing-user",
      email: "test@example.com",
      name: "Existing User",
      password: "hashedPassword",
      role: "USER",
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockBody),
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.error).toBe("Пользователь с таким email уже существует")
  })

  it("should return 400 for invalid email", async () => {
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "password123", name: "Test User" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("Некорректный email")
  })

  it("should return 400 for short password", async () => {
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "short", name: "Test User" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("минимум 8 символов")
  })

  it("should return 400 for short name", async () => {
    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123", name: "A" }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain("минимум 2 символа")
  })

  it("should handle database errors", async () => {
    vi.mocked(db.user.findUnique).mockRejectedValueOnce(new Error("Database error"))

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe("Ошибка при регистрации")
  })

  it("should handle hash errors", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(hash).mockRejectedValueOnce(new Error("Hash error"))

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe("Ошибка при регистрации")
  })

  it("should send welcome email after registration", async () => {
    const mockBody = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    const mockUser = {
      id: "user-123",
      email: mockBody.email,
      name: mockBody.name,
      password: "hashedPassword",
      role: "USER" as const,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(hash).mockResolvedValueOnce("hashedPassword")
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    vi.mocked(db.user.create).mockResolvedValueOnce(mockUser)
    vi.mocked(db.userProgress.create).mockResolvedValueOnce({
      id: "progress-1",
      userId: mockUser.id,
      topic: "general",
      completedCount: 0,
      lastCompleted: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(db.userSettings.create).mockResolvedValueOnce({
      id: "settings-1",
      userId: mockUser.id,
      theme: "system",
      language: "ru",
      fontSize: "normal",
      reduceMotion: false,
      highContrast: false,
      showAnimations: true,
      soundEnabled: false,
      volume: 50,
      autoSave: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockBody),
    })

    await POST(request)

    expect(sendWelcomeEmail).toHaveBeenCalledWith("test@example.com", "Test User")
  })
})
