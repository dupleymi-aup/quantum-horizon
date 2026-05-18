import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:live")

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const [recentActivities, latestByUser, todayStats] = await Promise.all([
      db.userActivity.findMany({
        where: { createdAt: { gte: thirtyMinAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      db.userActivity.groupBy({
        by: ["userId"],
        _max: { createdAt: true },
        where: { createdAt: { gte: oneHourAgo } },
      }),
      db.userActivity.findMany({
        where: { createdAt: { gte: new Date(new Date().toDateString()) } },
        select: { action: true, userId: true },
      }),
    ])

    const currentlyActive = new Set(latestByUser.map((u) => u.userId)).size

    const todayActions = new Map<string, number>()
    const todayUsers = new Set<string>()
    for (const a of todayStats) {
      todayActions.set(a.action, (todayActions.get(a.action) ?? 0) + 1)
      todayUsers.add(a.userId)
    }

    return NextResponse.json({
      success: true,
      data: {
        currentlyActive,
        recentActivities: recentActivities.map((a) => ({
          id: a.id,
          action: a.action,
          topic: a.topic,
          userName: (a as unknown as { user: { name: string | null } }).user?.name,
          createdAt: a.createdAt.toISOString(),
        })),
        todayStats: {
          uniqueUsers: todayUsers.size,
          byType: Array.from(todayActions.entries()).map(([action, count]) => ({ action, count })),
        },
        fiveMinCount: await db.userActivity.count({ where: { createdAt: { gte: fiveMinAgo } } }),
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching live data:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch live data" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
