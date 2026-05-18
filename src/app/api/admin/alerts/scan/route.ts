import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

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

    const newAlerts: Array<{ userId: string; type: string; message: string; severity: string }> = []

    for (const user of allUsers) {
      // Skip users registered less than 14 days ago
      if (new Date(user.createdAt) > fourteenDaysAgo) continue

      const [recentCount, prevCount, progressCount] = await Promise.all([
        db.userActivity.count({
          where: { userId: user.id, createdAt: { gte: fourteenDaysAgo } },
        }),
        db.userActivity.count({
          where: {
            userId: user.id,
            createdAt: { gte: twentyEightDaysAgo, lt: fourteenDaysAgo },
          },
        }),
        db.userProgress.count({
          where: { userId: user.id, completedCount: { gt: 0 } },
        }),
      ])

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

    const created = []
    for (const alert of newAlerts) {
      const existing = await db.adminAlert.findFirst({
        where: {
          userId: alert.userId,
          type: alert.type,
          createdAt: { gte: fourteenDaysAgo },
        },
      })
      if (!existing) {
        created.push(
          await db.adminAlert.create({
            data: {
              userId: alert.userId,
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
            },
          })
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scanned: allUsers.length,
        alertsCreated: created.length,
        alerts: created,
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

export const POST = withRateLimit(POSTHandler)
