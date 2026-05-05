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
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.status).toBe(200)
    })

    it("should allow access to /api index without auth", async () => {
      const request = new NextRequest("http://localhost:3000/api", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.status).toBe(200)
    })

    it("should allow access to auth pages without auth", async () => {
      const request = new NextRequest("http://localhost:3000/auth/signin", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.status).toBe(200)
    })
  })

  describe("Security headers", () => {
    it("should add security headers to non-public responses", async () => {
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
      expect(response.headers.get("X-Frame-Options")).toBe("DENY")
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block")
      expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    })
  })

  describe("Auth protection", () => {
    it("should return 401 for protected API paths without auth", async () => {
      const request = new NextRequest("http://localhost:3000/api/visualizations/bookmarks", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.status).toBe(401)
    })

    it("should redirect to signin from signout without auth", async () => {
      const request = new NextRequest("http://localhost:3000/auth/signout", {
        headers: {
          origin: "http://localhost:3000",
          "x-forwarded-for": "127.0.0.1",
        },
      })

      const { proxy } = await import("./proxy")
      const response = await proxy(request)

      expect(response.status).toBe(307)
    })

    it.todo("should redirect away from auth pages when already authenticated", () => {
      // Requires mocking getToken to return a valid token
    })
  })
})
