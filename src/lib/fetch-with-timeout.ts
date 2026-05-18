/**
 * Fetch с таймаутом для предотвращения бесконечных загрузок
 * Automatically includes CSRF token for state-changing requests.
 */

import { isStateChangingMethod } from "@/lib/api-config"

export class FetchTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${String(timeoutMs)}ms`)
    this.name = "FetchTimeoutError"
  }
}

interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number
}

/**
 * Read a cookie by name from document.cookie
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift()
  return undefined
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 10000, ...fetchOptions } = options

  // Auto-add CSRF token for state-changing requests
  const headers = new Headers(fetchOptions.headers)
  if (options.method && isStateChangingMethod(options.method) && typeof document !== "undefined") {
    const csrfToken = getCookie("csrf-token")
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken)
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new FetchTimeoutError(timeoutMs)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
