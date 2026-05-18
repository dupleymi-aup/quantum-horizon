import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:activity")

const PERIOD_MAP: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const periodStr = searchParams.get("period") || "30d"
    const days = PERIOD_MAP[periodStr] ?? 30
    const topic = searchParams.get("topic") || undefined
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const where = {
      createdAt: { gte: startDate },
      ...(topic ? { topic } : {}),
    }

    const activities = await db.userActivity.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        action: true,
        topic: true,
        createdAt: true,
      },
    })

    const dailyMap = new Map<string, Record<string, number>>()

    for (const a of activities) {
      const date = a.createdAt.toISOString().split("T")[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          visualization_viewed: 0,
          lesson_completed: 0,
          quiz_passed: 0,
          quiz_failed: 0,
          achievement_unlocked: 0,
          preset_created: 0,
          comparison_performed: 0,
        })
      }
      const day = dailyMap.get(date)!
      if (a.action in day) {
        day[a.action]++
      }
    }

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, counts]) => ({
        date,
        visualizationViews: counts.visualization_viewed,
        lessonsCompleted: counts.lesson_completed,
        quizzesPassed: counts.quiz_passed,
        quizzesFailed: counts.quiz_failed,
        achievementUnlocks: counts.achievement_unlocked,
        presetsCreated: counts.preset_created,
        comparisonsPerformed: counts.comparison_performed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const topicBreakdown = await db.userActivity.groupBy({
      by: ["topic"],
      where: {
        ...where,
        topic: { not: null },
      },
      _count: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        dailyData,
        topicBreakdown: topicBreakdown
          .filter((t) => t.topic)
          .map((t) => ({ topic: t.topic!, count: t._count })),
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching activity analytics:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json(
      { error: "Failed to fetch activity analytics" },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(GETHandler)
