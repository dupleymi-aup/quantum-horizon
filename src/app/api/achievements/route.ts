import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z, treeifyError } from "zod"

const logger = createLogger("api:achievements")

// Zod schemas для валидации
const achievementSchema = z.object({
  achievementId: z.string().min(1).max(100),
  progress: z.number().min(0).max(10000).default(1),
  target: z.number().min(1).max(10000).default(1),
})

const unlockSchema = z.object({
  achievementId: z.string().min(1).max(100),
})

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user.id ?? null
}

/**
 * GET /api/achievements
 * Получить достижения пользователя
 */
async function GETHandler() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const achievements = await db.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      select: {
        id: true,
        achievementId: true,
        progress: true,
        target: true,
        unlockedAt: true,
      },
    })

    const totalUnlocked = achievements.filter((a) => a.progress >= a.target).length
    const totalXpEarned = achievements
      .filter((a) => a.progress >= a.target)
      .reduce((sum, _a) => sum + 10, 0) // 10 XP per achievement

    return NextResponse.json(
      {
        success: true,
        data: achievements,
        totalUnlocked,
        totalXpEarned,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  } catch (error) {
    logger.error(
      "Error fetching achievements:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

/**
 * POST /api/achievements
 * Разблокировать достижение или обновить прогресс
 *
 * Supports two modes:
 * 1. { achievementId, progress, target } — update progress
 * 2. { achievementId } — unlock achievement (sets progress = target)
 */
async function POSTHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()

    // Try unlock mode first (just achievementId)
    const unlockResult = unlockSchema.safeParse(body)
    if (
      unlockResult.success &&
      !(body as Record<string, unknown>).progress &&
      !(body as Record<string, unknown>).target
    ) {
      const { achievementId } = unlockResult.data

      const existing = await db.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId } },
      })

      if (existing) {
        if (existing.progress >= existing.target) {
          return NextResponse.json(
            { error: "Achievement already unlocked", data: existing },
            { status: 409 }
          )
        }
        // Set progress to target to unlock
        const updated = await db.userAchievement.update({
          where: { id: existing.id },
          data: { progress: existing.target, unlockedAt: new Date() },
        })

        return NextResponse.json(
          { success: true, data: updated, unlocked: true, xpReward: 10 },
          { headers: { "Cache-Control": "private, no-store" } }
        )
      }

      // Create and immediately unlock
      const achievement = await db.userAchievement.create({
        data: {
          userId,
          achievementId,
          progress: 1,
          target: 1,
          unlockedAt: new Date(),
        },
      })

      return NextResponse.json(
        { success: true, data: achievement, unlocked: true, xpReward: 10 },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    }

    // Full progress update mode
    const validationResult = achievementSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { achievementId, progress, target } = validationResult.data

    // Check if achievement already exists
    const existing = await db.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId } },
    })

    if (existing) {
      // Update progress
      const updated = await db.userAchievement.update({
        where: { id: existing.id },
        data: {
          progress: { increment: progress },
          ...(existing.progress + progress >= target && existing.progress < target
            ? { unlockedAt: new Date() }
            : {}),
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: updated,
          newlyUnlocked: updated.progress >= updated.target && existing.progress < existing.target,
        },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    } else {
      // Create new achievement
      const achievement = await db.userAchievement.create({
        data: {
          userId,
          achievementId,
          progress,
          target,
          ...(progress >= target ? { unlockedAt: new Date() } : {}),
        },
      })

      return NextResponse.json(
        { success: true, data: achievement, newlyUnlocked: progress >= target },
        { headers: { "Cache-Control": "private, no-store" } }
      )
    }
  } catch (error) {
    logger.error(
      "Error updating achievement:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
