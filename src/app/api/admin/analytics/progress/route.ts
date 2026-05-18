import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:progress")

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const totalUsers = await db.user.count()

    const progressByTopic = await db.userProgress.groupBy({
      by: ["topic"],
      _count: { userId: true },
      _sum: { completedCount: true },
      _max: { lastCompleted: true },
    })

    const bookmarksByTopic = await db.bookmark.groupBy({
      by: ["topic"],
      _count: { id: true },
    })

    const bookmarkMap = new Map<string, number>()
    for (const b of bookmarksByTopic) {
      bookmarkMap.set(b.topic, b._count.id)
    }

    const topicStats = progressByTopic.map((p) => {
      const completionRate = totalUsers > 0 ? Math.round((p._count.userId / totalUsers) * 100) : 0
      return {
        topic: p.topic,
        completionRate,
        avgProgress: p._sum.completedCount ?? 0,
        totalUsers: p._count.userId,
        bookmarkCount: bookmarkMap.get(p.topic) ?? 0,
        lastActivity: p._max.lastCompleted?.toISOString() ?? null,
      }
    })

    topicStats.sort((a, b) => b.completionRate - a.completionRate)

    return adminJson({
      success: true,
      data: {
        totalUsers,
        topicStats,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching progress analytics:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch progress analytics" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
