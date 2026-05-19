import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:engagement")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") ?? "30", 10)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const where = { createdAt: { gte: startDate } }

    const activities = await db.userActivity.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: { userId: true, action: true, topic: true, createdAt: true },
    })

    const dailyActiveMap = new Map<string, Set<string>>()
    for (const a of activities) {
      const date = a.createdAt.toISOString().split("T")[0]
      if (!dailyActiveMap.has(date)) {
        dailyActiveMap.set(date, new Set())
      }
      const set = dailyActiveMap.get(date)
      if (set) set.add(a.userId)
    }

    const activeUsersOverTime = Array.from(dailyActiveMap.entries())
      .map(([date, users]) => ({ date, count: users.size }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const visualizationCounts = new Map<string, number>()
    for (const a of activities) {
      if (a.action === "visualization_viewed" && a.topic) {
        visualizationCounts.set(a.topic, (visualizationCounts.get(a.topic) ?? 0) + 1)
      }
    }

    const popularVisualizations = Array.from(visualizationCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const userSessionCounts = await db.userActivity.groupBy({
      by: ["userId"],
      _count: { id: true },
      where,
    })

    const ranges = [
      { label: "1-5", min: 1, max: 5 },
      { label: "6-20", min: 6, max: 20 },
      { label: "21-50", min: 21, max: 50 },
      { label: "51+", min: 51, max: Infinity },
    ]

    const sessionDistribution = ranges.map((r) => ({
      range: r.label,
      count: userSessionCounts.filter((u) => u._count.id >= r.min && u._count.id <= r.max).length,
    }))

    return adminJson({
      success: true,
      data: {
        activeUsersOverTime,
        popularVisualizations,
        sessionDistribution,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching engagement analytics:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch engagement analytics" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
