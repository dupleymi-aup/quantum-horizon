/**
 * Rate limiting utilities for API routes
 * Uses in-memory rate limiter as fallback when Redis is unavailable
 */

import { createInMemoryRateLimiter } from "@/lib/in-memory-rate-limiter"
import { RATE_LIMITS, getClientIdentifier } from "@/lib/api-config"
import { NextRequest, NextResponse } from "next/server"

type RateLimitPath = keyof typeof RATE_LIMITS

// Create rate limiters for each endpoint
const rateLimiters = new Map<string, ReturnType<typeof createInMemoryRateLimiter>>()

for (const [path, config] of Object.entries(RATE_LIMITS)) {
  rateLimiters.set(path, createInMemoryRateLimiter(config.requests, config.window, path))
}

/**
 * Find the matching rate limit config for a given pathname
 */
function matchRateLimit(pathname: string): RateLimitPath | null {
  // Exact match first
  if (pathname in RATE_LIMITS) return pathname as RateLimitPath

  // Prefix match (e.g. /api/visualizations/progress matches /api/visualizations)
  for (const path of Object.keys(RATE_LIMITS)) {
    if (pathname.startsWith(path)) return path as RateLimitPath
  }

  return null
}

/**
 * Apply rate limiting to a request
 * Returns null if request is allowed, or a NextResponse with 429 if rate limited
 */
export function applyRateLimit(request: NextRequest): NextResponse | null {
  const pathname = new URL(request.url).pathname
  const matchedPath = matchRateLimit(pathname)

  if (!matchedPath) return null

  const limiter = rateLimiters.get(matchedPath)
  if (!limiter) return null

  const clientId = getClientIdentifier(request)
  const result = limiter.limit(clientId)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Слишком много запросов. Попробуйте позже.",
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const pathname = new URL(request.url).pathname
  const matchedPath = matchRateLimit(pathname)

  if (!matchedPath) return response

  const limiter = rateLimiters.get(matchedPath)
  if (!limiter) return response

  const clientId = getClientIdentifier(request)
  const result = limiter.peek(clientId)

  response.headers.set("X-RateLimit-Limit", String(result.limit))
  response.headers.set("X-RateLimit-Remaining", String(result.remaining))
  response.headers.set("X-RateLimit-Reset", String(Math.floor(result.reset / 1000)))

  return response
}

/**
 * Helper to wrap an API handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const rateLimitResponse = applyRateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const ctx = args[0] as { params?: unknown } | undefined
    const response = await handler(request, ctx ?? {})
    return addRateLimitHeaders(response, request)
  }
}
