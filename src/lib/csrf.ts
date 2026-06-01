/**
 * CSRF protection utilities for API routes
 *
 * Uses the Double Submit Cookie pattern:
 * - For same-origin requests: validates Origin/Referer headers
 * - For cross-origin: requires CSRF token in header matching cookie value
 */
import { NextRequest, NextResponse } from "next/server"
import { createLogger } from "@/lib/logger"
import { ALLOWED_ORIGINS, isStateChangingMethod } from "@/lib/api-config"

const logger = createLogger("csrf")

/**
 * Validate that the request origin matches allowed origins
 */
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  // For same-origin requests, origin header is sent by browsers
  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.startsWith(`${allowed}/`))
  }

  // Fallback to referer check
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return ALLOWED_ORIGINS.some((allowed) => refererUrl.origin === new URL(allowed).origin)
    } catch {
      return false
    }
  }

  // No origin or referer — this is suspicious for browser requests
  // Only allow if sec-fetch-site indicates same-origin (browsers always send these headers)
  const secFetchSite = request.headers.get("sec-fetch-site")
  if (secFetchSite === "same-origin") {
    return true
  }

  // Deny requests without proper origin/referer headers
  // This prevents bypass by stripping headers in cross-site requests
  return false
}

/**
 * Validate CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
 * Uses Double Submit Cookie pattern:
 * 1. Client reads CSRF token from cookie (set by middleware)
 * 2. Client sends token in X-CSRF-Token header
 * 3. Server validates header matches cookie
 */
function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get("csrf-token")?.value
  const headerToken = request.headers.get("x-csrf-token")

  if (!cookieToken || !headerToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Validate CSRF protection for a request
 * Returns null if valid, or a NextResponse with 403 if invalid
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Only protect state-changing methods
  if (!isStateChangingMethod(request.method)) {
    return null
  }

  // Check origin/referer first
  if (!isValidOrigin(request)) {
    logger.warn("CSRF: Invalid origin for request", {
      method: request.method,
      url: request.url,
      origin: request.headers.get("origin"),
    })
    return NextResponse.json({ error: "CSRF validation failed: invalid origin" }, { status: 403 })
  }

  // For same-origin requests with sec-fetch-site, origin check is sufficient
  const secFetchSite = request.headers.get("sec-fetch-site")
  if (secFetchSite === "same-origin") {
    return null
  }

  // For cross-site or missing sec-fetch-site, validate CSRF token
  if (!validateCsrfToken(request)) {
    logger.warn("CSRF: Invalid or missing CSRF token", {
      method: request.method,
      url: request.url,
    })
    return NextResponse.json({ error: "CSRF validation failed: invalid token" }, { status: 403 })
  }

  return null
}

/**
 * Generate a CSRF token for setting as cookie
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Wrapper that adds CSRF validation to an API handler
 */
export function withCsrf(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const csrfError = validateCsrf(request)
    if (csrfError) return csrfError

    return handler(request, ...args)
  }
}
