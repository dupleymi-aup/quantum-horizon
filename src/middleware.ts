import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Пути, доступные без авторизации
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/offline",
]

// Публичные API маршруты
const publicApiPaths = [
  "/api/auth",
  "/api", // API index
]

// Статические ресурсы и Next.js internals
const excludedPaths = [
  "/_next",
  "/favicon",
  "/icons",
  "/manifest.json",
  "/sw.js",
  "/sw.js.map",
  "/workbox",
  "/offline.html",
]

// Регулярка для статических файлов
const staticFileRegex = /\.(ico|svg|png|jpg|jpeg|webp|avif|woff2?|ttf|eot|css|js|map)$/

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true
  if (publicApiPaths.some((p) => pathname.startsWith(p))) return true
  if (excludedPaths.some((p) => pathname.startsWith(p))) return true
  if (staticFileRegex.exec(pathname)) return true
  return false
}

// Защищённые маршруты, требующие авторизации
const protectedPaths = ["/api/visualizations", "/api/activity", "/api/achievements"]

function isProtectedApiPath(pathname: string): boolean {
  return protectedPaths.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем публичные маршруты
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Проверяем JWT токен
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Защита API маршрутов — возвращаем 401 для неавторизованных
  if (isProtectedApiPath(pathname) && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Защита страниц — редирект на вход
  if (!token && pathname.startsWith("/auth/signout")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Авторизованный пользователь на странице входа — редирект на главную
  if (token && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Добавляем security заголовки для всех ответов
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Совпадает со всеми путями, кроме:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico, иконки, manifest
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|manifest\\.json|sw\\.js|workbox).*)",
  ],
}
