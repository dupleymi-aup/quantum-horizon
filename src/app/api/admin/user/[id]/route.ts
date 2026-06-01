import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:user-detail")

async function GETHandler(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { id: userId } = await params

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return adminJson({ error: "User not found" }, { status: 404 })
    }

    const [activities, progress, bookmarks, achievements, sessions] = await Promise.all([
      db.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.userProgress.findMany({
        where: { userId },
        orderBy: { lastCompleted: "desc" },
      }),
      db.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      db.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: "desc" },
      }),
      db.userSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 50,
      }),
    ])

    const totalXp = activities.reduce((sum, a) => sum + a.xpGained, 0)

    const activityByType = new Map<string, number>()
    for (const a of activities) {
      activityByType.set(a.action, (activityByType.get(a.action) ?? 0) + 1)
    }

    const xpOverTime = activities
      .filter((a) => a.xpGained > 0)
      .slice(0, 30)
      .reverse()
      .map((a) => ({
        date: a.createdAt.toISOString().split("T")[0],
        xp: a.xpGained,
        action: a.action,
      }))

    return adminJson({
      success: true,
      data: {
        user,
        totalXp,
        totalActivities: activities.length,
        activityByType: Array.from(activityByType.entries()).map(([action, count]) => ({
          action,
          count,
        })),
        activities: activities.slice(0, 50),
        progress,
        bookmarks,
        achievements,
        sessions,
        xpOverTime,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching user detail:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch user details" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(
  GETHandler as (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
))
