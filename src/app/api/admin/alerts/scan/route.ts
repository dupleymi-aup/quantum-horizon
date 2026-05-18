import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:alerts:scan")

/**
 * Scan for at-risk students and create alerts
 * Criteria:
 * - No activity in 14 days (inactive)
 * - Declining activity (fewer activities in last 14d vs previous 14d)
 * - Low completion rate (< 2 topics with any progress)
 */
async function POSTHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)

    const allUsers = await db.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    const eligibleUsers = allUsers.filter((u) => new Date(u.createdAt) <= fourteenDaysAgo)
    const userIds = eligibleUsers.map((u) => u.id)

    // Fetch all activities in 2 queries instead of N*2
    const [recentActivities, prevActivities] = await Promise.all([
      db.userActivity.findMany({
        where: { userId: { in: userIds }, createdAt: { gte: fourteenDaysAgo } },
        select: { userId: true },
      }),
      db.userActivity.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { gte: twentyEightDaysAgo, lt: fourteenDaysAgo },
        },
        select: { userId: true },
      }),
    ])

    // Fetch all progress counts in 1 query instead of N
    const progressData = await db.userProgress.groupBy({
      by: ["userId"],
      _count: { id: true },
      where: { userId: { in: userIds }, completedCount: { gt: 0 } },
    })

    // Aggregate in memory
    const recentCountMap = new Map<string, number>()
    for (const a of recentActivities) {
      recentCountMap.set(a.userId, (recentCountMap.get(a.userId) ?? 0) + 1)
    }
    const prevCountMap = new Map<string, number>()
    for (const a of prevActivities) {
      prevCountMap.set(a.userId, (prevCountMap.get(a.userId) ?? 0) + 1)
    }
    const progressCountMap = new Map<string, number>()
    for (const p of progressData) {
      progressCountMap.set(p.userId, p._count.id)
    }

    const newAlerts: Array<{ userId: string; type: string; message: string; severity: string }> = []

    for (const user of eligibleUsers) {
      const recentCount = recentCountMap.get(user.id) ?? 0
      const prevCount = prevCountMap.get(user.id) ?? 0
      const progressCount = progressCountMap.get(user.id) ?? 0

      // Inactive for 14+ days
      if (recentCount === 0) {
        newAlerts.push({
          userId: user.id,
          type: "inactive_student",
          message: `${user.name ?? user.email ?? "Unknown user"} has been inactive for 14+ days`,
          severity: "warning",
        })
      }
      // Declining activity
      else if (prevCount > 0 && recentCount < prevCount * 0.5) {
        newAlerts.push({
          userId: user.id,
          type: "declining_activity",
          message: `${user.name ?? user.email ?? "Unknown user"} activity dropped ${String(Math.round((1 - recentCount / prevCount) * 100))}% compared to previous period`,
          severity: "info",
        })
      }
      // Low engagement
      if (progressCount < 2) {
        newAlerts.push({
          userId: user.id,
          type: "low_engagement",
          message: `${user.name ?? user.email ?? "Unknown user"} has progress in only ${String(progressCount)} topic(s)`,
          severity: progressCount === 0 ? "critical" : "warning",
        })
      }
    }

    // Check for existing alerts in batch
    const existingAlerts = await db.adminAlert.findMany({
      where: {
        userId: { in: newAlerts.map((a) => a.userId) },
        type: { in: [...new Set(newAlerts.map((a) => a.type))] },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { userId: true, type: true },
    })
    const existingSet = new Set<string>()
    for (const a of existingAlerts) {
      const key = [a.userId, a.type].join(":")
      existingSet.add(key)
    }

    const alertsToCreate = newAlerts.filter((a) => !existingSet.has(`${a.userId}:${a.type}`))

    // Batch create
    const created =
      alertsToCreate.length > 0
        ? await db.adminAlert.createMany({ data: alertsToCreate })
        : { count: 0 }

    return NextResponse.json({
      success: true,
      data: {
        scanned: allUsers.length,
        alertsCreated: created.count,
        alerts: alertsToCreate,
      },
    })
  } catch (error) {
    logger.error(
      "Error scanning at-risk students:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to scan" }, { status: 500 })
  }
}

export const POST = withCsrf(withRateLimit(POSTHandler))
