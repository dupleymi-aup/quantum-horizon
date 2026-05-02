/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST, GET, PATCH } from "@/app/api/auth/reset-password/route"

// Mock dependencies
vi.mock("bcryptjs", () => ({
  hash: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    passwordResetToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
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
  })),
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

describe("api/auth/reset-password/route", () => {
  describe("POST (reset password)", () => {
    it("should reset password successfully", async () => {
      const mockBody = {
        token: "valid-token",
        password: "newPassword123",
      }

      const mockToken = {
        token: "valid-token",
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000),
      }

      vi.mocked(hash).mockResolvedValue("hashedPassword")
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(mockToken)
      vi.mocked(db.user.update).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: "USER",
      })
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue(mockToken)

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe("Пароль успешно изменен")
      expect(hash).toHaveBeenCalledWith("newPassword123", 12)
      expect(db.user.update).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        data: { password: "hashedPassword" },
      })
    })

    it("should return 400 for invalid token", async () => {
      const mockBody = {
        token: "invalid-token",
        password: "newPassword123",
      }

      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Неверный токен сброса пароля")
    })

    it("should return 400 for expired token", async () => {
      const mockBody = {
        token: "expired-token",
        password: "newPassword123",
      }

      const expiredToken = {
        token: "expired-token",
        email: "test@example.com",
        expires: new Date(Date.now() - 3600000),
      }

      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(expiredToken)
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue(expiredToken)

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Токен сброса пароля истек")
    })

    it("should return 400 for short password", async () => {
      const mockBody = {
        token: "valid-token",
        password: "short",
      }

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
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

    it("should handle database errors", async () => {
      const mockBody = {
        token: "valid-token",
        password: "newPassword123",
      }

      const mockToken = {
        token: "valid-token",
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000),
      }

      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(mockToken)
      vi.mocked(db.user.update).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Ошибка при сбросе пароля")
    })
  })

  describe("GET (validate token)", () => {
    it("should return valid token", async () => {
      const mockToken = {
        token: "valid-token",
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000),
      }

      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(mockToken)

      const request = new NextRequest("http://localhost/api/auth/reset-password?token=valid-token", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.valid).toBe(true)
    })

    it("should return invalid for non-existent token", async () => {
      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/auth/reset-password?token=invalid-token", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.valid).toBe(false)
      expect(data.error).toBe("Неверный токен")
    })

    it("should return invalid for expired token and delete it", async () => {
      const expiredToken = {
        token: "expired-token",
        email: "test@example.com",
        expires: new Date(Date.now() - 3600000),
      }

      vi.mocked(db.passwordResetToken.findUnique).mockResolvedValue(expiredToken)
      vi.mocked(db.passwordResetToken.delete).mockResolvedValue(expiredToken)

      const request = new NextRequest("http://localhost/api/auth/reset-password?token=expired-token", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.valid).toBe(false)
      expect(data.error).toBe("Токен истек")
      expect(db.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { token: "expired-token" },
      })
    })

    it("should return 400 when token is missing", async () => {
      const request = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "GET",
      })

      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe("Токен не предоставлен")
    })
  })

  describe("PATCH (request reset)", () => {
    it("should send reset password email", async () => {
      const mockBody = {
        email: "test@example.com",
      }

      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        password: "hashedPassword",
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(db.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 })
      vi.mocked(db.passwordResetToken.create).mockResolvedValue({
        token: "new-token",
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000),
      })
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: true })

      const request = new NextRequest("http://localhost/api/auth/request-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe("Если пользователь существует, письмо отправлено")
      expect(sendPasswordResetEmail).toHaveBeenCalledWith("test@example.com", expect.any(String))
    })

    it("should return success even if user doesn't exist", async () => {
      const mockBody = {
        email: "nonexistent@example.com",
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(null)

      const request = new NextRequest("http://localhost/api/auth/request-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toBe("Если пользователь существует, письмо отправлено")
    })

    it("should handle email sending failure", async () => {
      const mockBody = {
        email: "test@example.com",
      }

      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        password: "hashedPassword",
      }

      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(db.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 })
      vi.mocked(db.passwordResetToken.create).mockResolvedValue({
        token: "new-token",
        email: "test@example.com",
        expires: new Date(Date.now() + 3600000),
      })
      vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: false, error: "Email service unavailable" })

      const request = new NextRequest("http://localhost/api/auth/request-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      // Should still return success even if email failed
      expect(data.message).toBe("Если пользователь существует, письмо отправлено")
    })

    it("should return 400 for invalid email", async () => {
      const mockBody = {
        email: "invalid-email",
      }

      const request = new NextRequest("http://localhost/api/auth/request-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain("Некорректный email")
    })

    it("should handle database errors", async () => {
      const mockBody = {
        email: "test@example.com",
      }

      vi.mocked(db.user.findUnique).mockRejectedValue(new Error("Database error"))

      const request = new NextRequest("http://localhost/api/auth/request-reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockBody),
      })

      const response = await PATCH(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe("Ошибка при запросе сброса пароля")
    })
  })
})
