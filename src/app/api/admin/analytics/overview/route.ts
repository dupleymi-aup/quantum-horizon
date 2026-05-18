import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:overview")

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeUsers7d,
      activeUsers30d,
      totalActivities,
      activitiesByType,
      totalSessions,
      avgSessionDuration,
    ] = await Promise.all([
      db.user.count(),
      db.userActivity
        .findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((r) => r.length),
      db.userActivity
        .findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((r) => r.length),
      db.userActivity.count(),
      db.userActivity.groupBy({
        by: ["action"],
        _count: true,
      }),
      db.userSession.count(),
      db.userSession
        .aggregate({
          _avg: { durationSec: true },
        })
        .then((r) => Math.round(r._avg.durationSec ?? 0)),
    ])

    return adminJson({
      success: true,
      data: {
        totalUsers,
        activeUsers7d,
        activeUsers30d,
        totalActivities,
        activitiesByType: activitiesByType.map((a) => ({
          action: a.action,
          count: a._count,
        })),
        totalSessions,
        avgSessionDuration,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching overview:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch overview" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
