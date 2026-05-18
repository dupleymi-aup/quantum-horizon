import { NextResponse } from "next/server"

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
}

/**
 * Create a JSON response with security-appropriate Cache-Control headers
 */
export function adminJson(data: unknown, init?: ResponseInit): NextResponse {
  const headers: Record<string, string> = { ...NO_CACHE_HEADERS }
  if (init?.headers) {
    for (const [key, value] of Object.entries(init.headers as Record<string, string>)) {
      headers[key] = value
    }
  }
  return NextResponse.json(data, { ...init, headers })
}
