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
    passwordResetToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
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
import { sendPasswordResetEmail } from "@/lib/email"

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

const { POST, GET, PATCH } = await import("@/app/api/auth/reset-password/route")

describe("api/auth/reset-password/route", () => {
  describe("POST (reset password with token)", () => {
    it("should reset password with valid token", async () => {
      const futureDate = new Date(Date.now() + 3600000)
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
        token: "valid-token",
        email: "test@example.com",
        expires: futureDate,
      })
      vi.mocked(hash).mockResolvedValue("hashedPassword")
      vi.mocked(db.user.update).mockResolvedValue({ id: "user-123" })
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue({})

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token", password: "newpassword123" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe("Пароль успешно изменен")
      expect(hash).toHaveBeenCalledWith("newpassword123", 12)
    })

    it("should return 400 for invalid token", async () => {
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "invalid-token", password: "newpassword123" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Неверный токен сброса пароля")
    })

    it("should return 400 for expired token", async () => {
      const pastDate = new Date(Date.now() - 3600000)
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
        token: "expired-token",
        email: "test@example.com",
        expires: pastDate,
      })
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue({})

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "expired-token", password: "newpassword123" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Токен сброса пароля истек")
    })

    it("should return 400 for short password", async () => {
      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token", password: "short" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain("минимум 8 символов")
    })

    it("should handle database errors", async () => {
      vi.mocked(db.passwordResetToken.findUnique).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-token", password: "newpassword123" }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Ошибка при сбросе пароля")
    })
  })

  describe("GET (check token validity)", () => {
    it("should return valid for non-expired token", async () => {
      const futureDate = new Date(Date.now() + 3600000)
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
        token: "valid-token",
        email: "test@example.com",
        expires: futureDate,
      })

      const request = new NextRequest("http://localhost/api/auth/reset-password?token=valid-token")
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(true)
    })

    it("should return invalid for non-existent token", async () => {
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(null)

      const request = new NextRequest(
        "http://localhost/api/auth/reset-password?token=invalid-token"
      )
      const response = await GET(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.valid).toBe(false)
    })

    it("should return invalid for expired token and delete it", async () => {
      const pastDate = new Date(Date.now() - 3600000)
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue({
        token: "expired-token",
        email: "test@example.com",
        expires: pastDate,
      })
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue({})

      const request = new NextRequest(
        "http://localhost/api/auth/reset-password?token=expired-token"
      )
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.valid).toBe(false)
      expect(db.passwordResetToken.delete).toHaveBeenCalled()
    })

    it("should return 400 when token is missing", async () => {
      const request = new NextRequest("http://localhost/api/auth/reset-password")
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Токен не предоставлен")
    })
  })

  describe("PATCH (request password reset)", () => {
    it("should create reset token and send email for existing user", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
      })
      vi.mocked(db.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 })
      vi.mocked(db.passwordResetToken.create).mockResolvedValue({})
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: true })

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(db.passwordResetToken.create).toHaveBeenCalled()
      expect(sendPasswordResetEmail).toHaveBeenCalled()
    })

    it("should return success even for non-existing user (security)", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nonexistent@example.com" }),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(db.passwordResetToken.create).not.toHaveBeenCalled()
    })

    it("should return 400 for invalid email", async () => {
      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid-email" }),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain("Некорректный email")
    })

    it("should handle database errors", async () => {
      vi.mocked(db.user.findUnique).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Ошибка при запросе сброса пароля")
    })
  })
})
