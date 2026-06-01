/* eslint-disable @typescript-eslint/no-deprecated */
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"
import { UserRole } from "@prisma/client"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { sendWelcomeEmail } from "@/lib/email"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:users")

const createUserSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя должно содержать не более 50 символов")
    .optional(),
  role: z.enum(["USER", "TEACHER", "MODERATOR", "ADMIN"]).default("USER"),
})

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10), 1), 100)
    const search = searchParams.get("search") ?? ""
    const role = searchParams.get("role") ?? ""
    const skip = (page - 1) * limit

    const where = {
      ...(search
        ? {
            OR: [{ name: { contains: search } }, { email: { contains: search } }],
          }
        : {}),
      ...(role ? { role: role as UserRole } : {}),
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          image: true,
        },
      }),
      db.user.count({ where }),
    ])

    const userIds = users.map((u) => u.id)
    const activityCounts = await db.userActivity.groupBy({
      by: ["userId"],
      _count: { id: true },
      _sum: { xpGained: true },
      _max: { createdAt: true },
      where: { userId: { in: userIds } },
    })

    const activityMap = new Map(
      activityCounts.map((a) => [
        a.userId,
        {
          activityCount: a._count,
          totalXp: a._sum.xpGained ?? 0,
          lastActive: a._max.createdAt?.toISOString() ?? null,
        },
      ])
    )

    const usersWithStats = users.map((u) => ({
      ...u,
      activityCount: activityMap.get(u.id)?.activityCount ?? 0,
      totalXp: activityMap.get(u.id)?.totalXp ?? 0,
      lastActive: activityMap.get(u.id)?.lastActive ?? null,
    }))

    return adminJson({
      success: true,
      data: {
        users: usersWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error("Error fetching users:", error instanceof Error ? error.message : "Unknown error")
    return adminJson({ error: "Failed to fetch users" }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Создание нового пользователя администратором с выбором любой роли
 */
async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const body = (await request.json()) as Record<string, unknown>
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return adminJson(
        { error: validation.error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 }
      )
    }

    const { email, password, name, role } = validation.data

    // Проверка существования пользователя
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return adminJson({ error: "Пользователь с таким email уже существует" }, { status: 409 })
    }

    // Хэширование пароля
    const hashedPassword = await hash(password, 12)

    // Создание пользователя с выбранной ролью
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? null,
        role,
      },
    })

    // Создание записи прогресса
    await db.userProgress.create({
      data: {
        userId: user.id,
        topic: "general",
        completedCount: 0,
      },
    })

    // Создание настроек пользователя
    await db.userSettings.create({
      data: {
        userId: user.id,
        theme: "system",
        language: "ru",
      },
    })

    // Отправка приветственного письма
    if (user.email) {
      const welcomeResult = await sendWelcomeEmail(user.email, user.name ?? undefined)
      if (!welcomeResult.success) {
        logger.warn("Failed to send welcome email:", welcomeResult.error)
      }
    }

    logger.info(
      `User created by admin ${authResult.userId}: ${user.email ?? "no-email"} with role ${role}`
    )

    return adminJson(
      {
        success: true,
        message: "Пользователь успешно создан",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Error creating user:", error instanceof Error ? error.message : "Unknown error")
    return adminJson({ error: "Ошибка при создании пользователя" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
export const POST = withCsrf(withRateLimit(POSTHandler))
