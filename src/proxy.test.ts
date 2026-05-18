import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

// Mock next-auth JWT — default: no token (unauthenticated)
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn().mockResolvedValue(null),
}))

// Mock Upstash — используем in-memory fallback
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    }),
  })),
}))

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}))

// Mock in-memory rate limiter
vi.mock("@/lib/in-memory-rate-limiter", () => ({
  createInMemoryRateLimiter: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    }),
  })),
}))

describe("Proxy", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Public paths", () => {
    it("should allow access to root without auth", async () => {
      const request = new NextRequest("http://localhost:3000/ru", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.status).toBe(200)
    })

    it("should allow access to /api routes without auth", async () => {
      const request = new NextRequest("http://localhost:3000/ru/api/auth/session", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.status).toBe(200)
    })

    it("should allow access to auth pages without auth", async () => {
      const request = new NextRequest("http://localhost:3000/ru/auth/signin", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.status).toBe(200)
    })
  })

  describe("Auth protection", () => {
    it("should redirect to signin for protected pages without auth", async () => {
      const request = new NextRequest("http://localhost:3000/ru/dashboard", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.status).toBe(307)
      expect(response.headers.get("location")).toContain("/auth/signin")
    })

    it("should redirect to signin from signout without auth", async () => {
      const request = new NextRequest("http://localhost:3000/ru/auth/signout", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.status).toBe(307)
    })

    it("should apply security headers to responses", async () => {
      const request = new NextRequest("http://localhost:3000/ru/any-page", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const proxyModule = await import("../proxy")
      const response = await proxyModule.default(request)

      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
      expect(response.headers.get("X-Frame-Options")).toBe("DENY")
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block")
      expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    })

    it.todo("should redirect away from auth pages when already authenticated", () => {
      // Requires mocking getToken to return a valid token
    })
  })
})
