import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:performance")

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const userActivities = await db.userActivity.groupBy({
      by: ["userId"],
      _sum: { xpGained: true },
      _count: { id: true },
      _max: { createdAt: true },
    })

    const userIds = userActivities.map((u) => u.userId)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const rankings = userActivities
      .map((u) => {
        const user = userMap.get(u.userId)
        return {
          userId: u.userId,
          name: user?.name ?? user?.email ?? "Unknown",
          email: user?.email ?? "",
          totalXp: u._sum.xpGained ?? 0,
          activityCount: u._count.id,
          lastActive: u._max.createdAt?.toISOString() ?? null,
          registeredAt: user?.createdAt.toISOString() ?? null,
        }
      })
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 50)

    const xpBuckets = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-500", min: 101, max: 500 },
      { range: "501-1000", min: 501, max: 1000 },
      { range: "1001-5000", min: 1001, max: 5000 },
      { range: "5000+", min: 5001, max: Infinity },
    ]

    const xpDistribution = xpBuckets.map((b) => ({
      range: b.range,
      count: rankings.filter((r) => r.totalXp >= b.min && r.totalXp <= b.max).length,
    }))

    const cohortMap = new Map<string, { totalXp: number; totalActivities: number; count: number }>()
    for (const r of rankings) {
      if (!r.registeredAt) continue
      const cohort = r.registeredAt.substring(0, 7)
      const existing = cohortMap.get(cohort) ?? { totalXp: 0, totalActivities: 0, count: 0 }
      existing.totalXp += r.totalXp
      existing.totalActivities += r.activityCount
      existing.count++
      cohortMap.set(cohort, existing)
    }

    const cohortComparison = Array.from(cohortMap.entries())
      .map(([cohort, data]) => ({
        cohort,
        avgXp: Math.round(data.totalXp / data.count),
        avgActivities: Math.round(data.totalActivities / data.count),
        users: data.count,
      }))
      .sort((a, b) => a.cohort.localeCompare(b.cohort))

    return NextResponse.json({
      success: true,
      data: {
        rankings,
        xpDistribution,
        cohortComparison,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching performance analytics:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch performance analytics" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
