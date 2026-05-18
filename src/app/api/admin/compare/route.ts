import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:compare")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get("ids")?.split(",") ?? []

    if (userIds.length < 2 || userIds.length > 5) {
      return NextResponse.json(
        { error: "Compare requires 2-5 student IDs" },
        { status: 400 }
      )
    }

    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const [activities, progress, achievements, sessions] = await Promise.all([
      db.userActivity.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, action: true, topic: true, xpGained: true, createdAt: true },
      }),
      db.userProgress.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, topic: true, completedCount: true, lastCompleted: true },
      }),
      db.userAchievement.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, achievementId: true, progress: true, target: true, unlockedAt: true },
      }),
      db.userSession.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, durationSec: true, topic: true, startedAt: true },
      }),
    ])

    const comparisons = userIds.map((uid) => {
      const user = userMap.get(uid)
      const userActivities = activities.filter((a) => a.userId === uid)
      const userProgress = progress.filter((p) => p.userId === uid)
      const userAchievements = achievements.filter((a) => a.userId === uid)
      const userSessions = sessions.filter((s) => s.userId === uid)

      const totalXp = userActivities.reduce((sum, a) => sum + a.xpGained, 0)
      const totalSessionTime = userSessions.reduce((sum, s) => sum + s.durationSec, 0)
      const topicCompletion = new Map<string, number>()
      for (const p of userProgress) {
        topicCompletion.set(p.topic, (topicCompletion.get(p.topic) ?? 0) + p.completedCount)
      }

      const activityByType = new Map<string, number>()
      for (const a of userActivities) {
        activityByType.set(a.action, (activityByType.get(a.action) ?? 0) + 1)
      }

      return {
        user: user ?? { id: uid, name: null, email: null, role: "USER", createdAt: null, image: null },
        totalXp,
        totalActivities: userActivities.length,
        totalAchievements: userAchievements.length,
        totalSessionTime,
        topicsCompleted: userProgress.length,
        topicCompletion: Array.from(topicCompletion.entries()).map(([topic, count]) => ({ topic, count })),
        activityByType: Array.from(activityByType.entries()).map(([action, count]) => ({ action, count })),
        lastActive: userActivities.length > 0
          ? Math.max(...userActivities.map((a) => new Date(a.createdAt).getTime()))
          : null,
      }
    })

    return NextResponse.json({ success: true, data: comparisons })
  } catch (error) {
    logger.error(
      "Error comparing students:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to compare students" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
