import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:reports")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") ?? "30d"
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const now = new Date()

    const where = { createdAt: { gte: startDate } }

    const [
      newUsers,
      totalActivities,
      activitiesByType,
      topicStats,
      sessionStats,
      achievementUnlocks,
    ] = await Promise.all([
      db.user.count({ where: { createdAt: { gte: startDate } } }),
      db.userActivity.count({ where }),
      db.userActivity.groupBy({ by: ["action"], where, _count: true }),
      db.userProgress.groupBy({
        by: ["topic"],
        _count: { userId: true },
        _sum: { completedCount: true },
      }),
      db.userSession.findMany({
        where: { startedAt: { gte: startDate } },
        select: { durationSec: true },
      }),
      db.userActivity.count({ where: { ...where, action: "achievement_unlocked" } }),
    ])

    const avgSessionDuration =
      sessionStats.length > 0
        ? Math.round(sessionStats.reduce((sum, s) => sum + s.durationSec, 0) / sessionStats.length)
        : 0

    const activityBreakdown = activitiesByType.map((a) => ({
      action: a.action,
      count: a._count,
    }))

    const topTopics = topicStats
      .map((t) => ({
        topic: t.topic,
        users: t._count.userId,
        completions: t._sum.completedCount ?? 0,
      }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10)

    const prevStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const prevActivities = await db.userActivity.count({
      where: { createdAt: { gte: prevStart, lt: startDate } },
    })

    const activityTrend =
      prevActivities > 0
        ? Math.round(((totalActivities - prevActivities) / prevActivities) * 100)
        : 0

    return adminJson({
      success: true,
      data: {
        period: { start: startDate.toISOString(), end: now.toISOString(), days },
        summary: {
          newUsers,
          totalActivities,
          achievementUnlocks,
          avgSessionDuration,
          activityTrend,
        },
        activityBreakdown,
        topTopics,
      },
    })
  } catch (error) {
    logger.error(
      "Error generating report:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to generate report" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
