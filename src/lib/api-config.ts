export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://quantum-horizon.vercel.app",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]

export const RATE_LIMITS = {
  "/api/auth/register": { requests: 3, window: "1 h" as const, prefix: "auth_register" },
  "/api/auth/reset-password": { requests: 2, window: "1 h" as const, prefix: "auth_reset" },
  "/api/auth/nextauth": { requests: 5, window: "1 m" as const, prefix: "auth" },
  "/api/visualizations": { requests: 100, window: "1 m" as const, prefix: "viz" },
  "/api/activity": { requests: 60, window: "1 m" as const, prefix: "activity" },
  "/api/achievements": { requests: 60, window: "1 m" as const, prefix: "achievements" },
  "/api/sessions": { requests: 30, window: "1 m" as const, prefix: "sessions" },
  "/api/admin": { requests: 30, window: "1 m" as const, prefix: "admin" },
} as const

export function isStateChangingMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
}

export function getClientIdentifier(request: {
  headers: { get(name: string): string | null }
}): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  if (forwarded) return forwarded.split(",")[0].trim()
  if (realIp) return realIp.trim()
  return "anonymous"
}
