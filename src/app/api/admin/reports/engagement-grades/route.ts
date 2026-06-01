import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:reports:engagement-grades")

function computeCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n < 2) return 0
  const avgX = x.reduce((a, b) => a + b, 0) / n
  const avgY = y.reduce((a, b) => a + b, 0) / n
  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - avgX
    const dy = y[i] - avgY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const denom = Math.sqrt(denX * denY)
  if (denom === 0) return 0
  return Math.round((num / denom) * 100) / 100
}

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const users = await db.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true },
    })

    // Batch fetch ALL data in parallel
    const [allGrades, allSessions, allActivityCounts, allActivityXp] = await Promise.all([
      db.grade.findMany({ select: { userId: true, score: true, maxScore: true } }),
      db.userSession.findMany({ select: { userId: true, durationSec: true } }),
      db.userActivity.groupBy({ by: ["userId"], _count: true }),
      db.userActivity.groupBy({ by: ["userId"], _sum: { xpGained: true } }),
    ])

    // Build lookup maps
    const gradesByUser = new Map<string, Array<{ score: number; maxScore: number }>>()
    for (const g of allGrades) {
      const arr = gradesByUser.get(g.userId) ?? []
      arr.push(g)
      gradesByUser.set(g.userId, arr)
    }

    const sessionsByUser = new Map<string, number>()
    for (const s of allSessions) {
      sessionsByUser.set(s.userId, (sessionsByUser.get(s.userId) ?? 0) + s.durationSec)
    }

    const activityCountByUser = new Map<string, number>()
    for (const a of allActivityCounts) {
      activityCountByUser.set(a.userId, a._count)
    }

    const activityXpByUser = new Map<string, number>()
    for (const a of allActivityXp) {
      activityXpByUser.set(a.userId, a._sum.xpGained ?? 0)
    }

    const scatterData: Array<{
      userId: string
      name: string | null
      activityCount: number
      totalSessionMinutes: number
      totalXp: number
      avgGrade: number
      assessmentCount: number
    }> = []

    for (const user of users) {
      const grades = gradesByUser.get(user.id)
      if (!grades || grades.length === 0) continue

      const avgGrade = Math.round(
        grades.map((g) => (g.score / g.maxScore) * 100).reduce((a, b) => a + b, 0) / grades.length
      )

      const activityCount = activityCountByUser.get(user.id) ?? 0
      const totalSessionMinutes = Math.round((sessionsByUser.get(user.id) ?? 0) / 60)
      const totalXp = activityXpByUser.get(user.id) ?? 0

      scatterData.push({
        userId: user.id,
        name: user.name,
        activityCount,
        totalSessionMinutes,
        totalXp,
        avgGrade,
        assessmentCount: grades.length,
      })
    }

    if (scatterData.length === 0) {
      return adminJson({
        success: true,
        data: {
          scatterData: [],
          quadrants: {
            highEngagementHighGrade: [],
            highEngagementLowGrade: [],
            lowEngagementHighGrade: [],
            lowEngagementLowGrade: [],
          },
          correlation: { activityGradeCorrelation: 0, sessionGradeCorrelation: 0 },
          summary: { totalStudents: 0, avgActivityCount: 0, avgGrade: 0 },
        },
      })
    }

    const avgActivity = scatterData.reduce((a, d) => a + d.activityCount, 0) / scatterData.length
    const avgGrade = scatterData.reduce((a, d) => a + d.avgGrade, 0) / scatterData.length

    const quadrants = {
      highEngagementHighGrade: [] as Array<{ userId: string; name: string | null; avgGrade: number; activityCount: number }>,
      highEngagementLowGrade: [] as Array<{ userId: string; name: string | null; avgGrade: number; activityCount: number }>,
      lowEngagementHighGrade: [] as Array<{ userId: string; name: string | null; avgGrade: number; activityCount: number }>,
      lowEngagementLowGrade: [] as Array<{ userId: string; name: string | null; avgGrade: number; activityCount: number }>,
    }

    for (const d of scatterData) {
      const highEngagement = d.activityCount >= avgActivity
      const highGrade = d.avgGrade >= avgGrade

      if (highEngagement && highGrade) {
        quadrants.highEngagementHighGrade.push({ userId: d.userId, name: d.name, avgGrade: d.avgGrade, activityCount: d.activityCount })
      } else if (highEngagement && !highGrade) {
        quadrants.highEngagementLowGrade.push({ userId: d.userId, name: d.name, avgGrade: d.avgGrade, activityCount: d.activityCount })
      } else if (!highEngagement && highGrade) {
        quadrants.lowEngagementHighGrade.push({ userId: d.userId, name: d.name, avgGrade: d.avgGrade, activityCount: d.activityCount })
      } else {
        quadrants.lowEngagementLowGrade.push({ userId: d.userId, name: d.name, avgGrade: d.avgGrade, activityCount: d.activityCount })
      }
    }

    const activityValues = scatterData.map((d) => d.activityCount)
    const gradeValues = scatterData.map((d) => d.avgGrade)
    const sessionValues = scatterData.map((d) => d.totalSessionMinutes)

    const activityGradeCorrelation = computeCorrelation(activityValues, gradeValues)
    const sessionGradeCorrelation = computeCorrelation(sessionValues, gradeValues)

    return adminJson({
      success: true,
      data: {
        scatterData,
        quadrants,
        correlation: { activityGradeCorrelation, sessionGradeCorrelation },
        summary: {
          totalStudents: scatterData.length,
          avgActivityCount: Math.round(avgActivity),
          avgGrade: Math.round(avgGrade),
        },
      },
    })
  } catch (error) {
    logger.error("Failed to generate engagement-grade correlation report", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
