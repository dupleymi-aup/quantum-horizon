/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { z } from "zod"
import { requireAdminRole } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:roles")

const updateRoleSchema = z.object({
  userId: z.cuid2("Некорректный ID пользователя"),
  role: z.enum(["USER", "TEACHER", "MODERATOR", "ADMIN"]),
})

/**
 * PATCH /api/admin/roles
 * Обновление роли пользователя (только для администраторов)
 */
async function PATCHHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireAdminRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const validation = updateRoleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 }
      )
    }

    const { userId, role } = validation.data

    // Проверка существования пользователя
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Обновление роли
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    logger.info(
      `User ${user.email ?? "unknown"} role changed from ${user.role} to ${role} by admin ${authCheck.userId}`
    )

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    logger.error("Update role error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Ошибка при обновлении роли" }, { status: 500 })
  }
}

/**
 * GET /api/admin/roles
 * Получение списка всех пользователей с их ролями
 */
async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireAdminRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get("role")

    const where = roleFilter ? { role: roleFilter } : {}

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      users,
      total: users.length,
    })
  } catch (error) {
    logger.error("Get users error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { error: "Ошибка при получении списка пользователей" },
      { status: 500 }
    )
  }
}

export const PATCH = withCsrf(withRateLimit(PATCHHandler))
export const GET = withCsrf(withRateLimit(GETHandler))
