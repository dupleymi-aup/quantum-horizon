import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const logger = createLogger("api:activity")

// Zod схемы для валидации
const activitySchema = z.object({
  action: z.string().min(1).max(200),
  topic: z.string().max(100).nullable().optional(),
  xpGained: z.number().min(0).max(10000).default(0),
})

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user.id ?? null
}

/**
 * GET /api/activity
 * Получить историю активности пользователя
 * Query params: limit (default 50, max 100), offset (default 0)
 */
async function GETHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100)
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0)

    const [activities, total] = await Promise.all([
      db.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          action: true,
          topic: true,
          xpGained: true,
          createdAt: true,
        },
      }),
      db.userActivity.count({ where: { userId } }),
    ])

    return NextResponse.json(
      { success: true, data: activities, total, limit, offset },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  } catch (error) {
    logger.error(
      "Error fetching activities:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}

/**
 * POST /api/activity
 * Записать новое действие
 */
async function POSTHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()

    // Валидация входных данных
    const validationResult = activitySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { action, topic, xpGained } = validationResult.data

    const activity = await db.userActivity.create({
      data: { userId, action, topic, xpGained },
      select: {
        id: true,
        action: true,
        topic: true,
        xpGained: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { success: true, data: activity },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  } catch (error) {
    logger.error(
      "Error logging activity:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
