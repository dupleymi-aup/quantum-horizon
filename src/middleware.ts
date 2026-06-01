import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

const ADMIN_ROUTES = ["/api/admin"]
const PROTECTED_ROUTES = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if request is for admin routes
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isProtectedPage = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAdminRoute || isProtectedPage) {
    const token = await getToken({ req: request })

    if (!token) {
      // Redirect to sign-in if not authenticated
      if (isProtectedPage) {
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role for admin routes
    if (isAdminRoute) {
      const role = token.role
      const isAdmin = role === "ADMIN" || role === "MODERATOR"

      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
  }

  // Add security headers to API responses
  const response = NextResponse.next()

  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  return response
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
}
