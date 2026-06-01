import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:reports:learning-velocity")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const users = await db.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    // Batch fetch ALL data in parallel
    const [allProgress, allGrades, allActivityCounts] = await Promise.all([
      db.userProgress.findMany({ select: { userId: true, topic: true, completedCount: true } }),
      db.grade.findMany({
        include: { assessment: { select: { maxScore: true } } },
        orderBy: { completedAt: "asc" },
      }),
      db.userActivity.groupBy({ by: ["userId"], _count: true }),
    ])

    // Build lookup maps
    const progressByUser = new Map<string, Array<{ topic: string; completedCount: number }>>()
    for (const p of allProgress) {
      const arr = progressByUser.get(p.userId) ?? []
      arr.push(p)
      progressByUser.set(p.userId, arr)
    }

    const gradesByUser = new Map<string, typeof allGrades>()
    for (const g of allGrades) {
      const arr = gradesByUser.get(g.userId) ?? []
      arr.push(g)
      gradesByUser.set(g.userId, arr)
    }

    const activityCountByUser = new Map<string, number>()
    for (const a of allActivityCounts) {
      activityCountByUser.set(a.userId, a._count)
    }

    const now = Date.now()

    const studentVelocities: Array<{
      userId: string
      name: string | null
      email: string | null
      daysEnrolled: number
      topicsCompleted: number
      velocity: number
      avgScoreImprovementRate: number
      activityFrequency: number
    }> = []

    for (const user of users) {
      const daysEnrolled = Math.max(
        1,
        Math.floor((now - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      )

      const progress = progressByUser.get(user.id) ?? []
      const topicsCompleted = progress.filter((p) => p.completedCount > 0).length
      const velocity = Math.round((topicsCompleted / daysEnrolled) * 30 * 10) / 10

      const grades = gradesByUser.get(user.id) ?? []
      let avgScoreImprovementRate = 0
      if (grades.length >= 2) {
        const percentages = grades.map((g) => (g.score / g.maxScore) * 100)
        const firstHalf = percentages.slice(0, Math.ceil(percentages.length / 2))
        const secondHalf = percentages.slice(Math.ceil(percentages.length / 2))
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
        avgScoreImprovementRate = Math.round((secondAvg - firstAvg) * 10) / 10
      }

      const activityCount = activityCountByUser.get(user.id) ?? 0
      const activityFrequency = Math.round((activityCount / daysEnrolled) * 30 * 10) / 10

      studentVelocities.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        daysEnrolled,
        topicsCompleted,
        velocity,
        avgScoreImprovementRate,
        activityFrequency,
      })
    }

    studentVelocities.sort((a, b) => b.velocity - a.velocity)

    if (studentVelocities.length === 0) {
      return adminJson({
        success: true,
        data: {
          studentVelocities: [],
          summary: {
            avgVelocity: 0,
            medianVelocity: 0,
            fastestStudents: [],
            slowestStudents: [],
            cumulativeCompletionCurve: [],
          },
        },
      })
    }

    const velocities = studentVelocities.map((s) => s.velocity)
    const avgVelocity = Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length * 10) / 10

    const sorted = [...velocities].sort((a, b) => a - b)
    const medianVelocity =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]

    const fastestStudents = studentVelocities.slice(0, 5).map((s) => ({
      userId: s.userId,
      name: s.name,
      velocity: s.velocity,
    }))

    const slowestStudents = studentVelocities
      .slice(-5)
      .reverse()
      .map((s) => ({ userId: s.userId, name: s.name, velocity: s.velocity }))

    const maxDays = Math.max(...studentVelocities.map((s) => s.daysEnrolled))
    const cumulativeCompletionCurve = []
    for (let day = 0; day <= maxDays; day += 7) {
      const completedByDay = studentVelocities
        .filter((s) => s.daysEnrolled >= day)
        .map((s) => Math.round((s.topicsCompleted / Math.max(1, s.daysEnrolled)) * day))
      const avgTopics =
        completedByDay.length > 0
          ? Math.round((completedByDay.reduce((a, b) => a + b, 0) / completedByDay.length) * 10) / 10
          : 0
      cumulativeCompletionCurve.push({ day, avgTopicsCompleted: avgTopics })
    }

    return adminJson({
      success: true,
      data: {
        studentVelocities,
        summary: {
          avgVelocity,
          medianVelocity: Math.round(medianVelocity * 10) / 10,
          fastestStudents,
          slowestStudents,
          cumulativeCompletionCurve,
        },
      },
    })
  } catch (error) {
    logger.error("Failed to generate learning velocity report", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
