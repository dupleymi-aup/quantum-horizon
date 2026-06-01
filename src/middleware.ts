import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

const ADMIN_ROUTES = ["/api/admin"]
const TEACHER_ROUTES = ["/api/teacher"]
const PROTECTED_ROUTES = ["/admin", "/teacher"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isTeacherRoute = TEACHER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isProtectedPage = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isAdminRoute || isTeacherRoute || isProtectedPage) {
    const token = await getToken({ req: request })

    if (!token) {
      if (isProtectedPage) {
        const signInUrl = new URL("/auth/signin", request.url)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isAdminRoute) {
      const role = token.role
      const isAdmin = role === "ADMIN" || role === "MODERATOR"

      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    if (isTeacherRoute) {
      const role = token.role
      const isTeacher = role === "TEACHER" || role === "ADMIN" || role === "MODERATOR"

      if (!isTeacher) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
  }

  const response = NextResponse.next()

  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }

  return response
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/teacher/:path*", "/admin/:path*", "/teacher/:path*"],
}
