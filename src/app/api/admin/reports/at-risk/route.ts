import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:reports:at-risk")

type MasteryLevel = "beginner" | "developing" | "proficient" | "advanced"
type TrendDirection = "improving" | "declining" | "stable"

function getMasteryLevel(avgScore: number): MasteryLevel {
  if (avgScore >= 85) return "advanced"
  if (avgScore >= 70) return "proficient"
  if (avgScore >= 50) return "developing"
  return "beginner"
}

function getTrendDirection(scores: number[]): TrendDirection {
  if (scores.length < 2) return "stable"
  const mid = Math.ceil(scores.length / 2)
  const firstHalf = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const secondHalf = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid)
  if (secondHalf > firstHalf + 5) return "improving"
  if (secondHalf < firstHalf - 5) return "declining"
  return "stable"
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
      select: { id: true, name: true, email: true, createdAt: true },
    })

    // Batch fetch ALL grades in one query
    const allGrades = await db.grade.findMany({
      include: { assessment: { select: { title: true, topic: true, maxScore: true } } },
      orderBy: { completedAt: "asc" },
    })

    // Batch fetch activity counts per user in one query
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activityCounts = await db.userActivity.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    })

    // Group grades by userId
    const gradesByUser = new Map<string, typeof allGrades>()
    for (const grade of allGrades) {
      const userGrades = gradesByUser.get(grade.userId) ?? []
      userGrades.push(grade)
      gradesByUser.set(grade.userId, userGrades)
    }

    // Map of userId -> activity count (last 30 days)
    const activityByUser = new Map<string, number>()
    for (const ac of activityCounts) {
      activityByUser.set(ac.userId, ac._count)
    }

    const atRiskStudents = []

    for (const user of users) {
      const grades = gradesByUser.get(user.id)
      if (!grades || grades.length === 0) continue

      const percentages = grades.map((g) => Math.round((g.score / g.maxScore) * 100))
      const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      const trendDirection = getTrendDirection(percentages)
      const masteryLevel = getMasteryLevel(avgScore)

      const lastGrade = grades[grades.length - 1]
      const lastGradeDate = lastGrade ? lastGrade.completedAt.toISOString().split("T")[0] : null

      const daysSinceLastActivity = lastGradeDate
        ? Math.floor((Date.now() - new Date(lastGradeDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      const topicMap = new Map<string, number[]>()
      for (let i = 0; i < grades.length; i++) {
        const topic = grades[i].assessment.topic
        const existing = topicMap.get(topic) ?? []
        existing.push(percentages[i])
        topicMap.set(topic, existing)
      }

      let weakestTopic: string | null = null
      let lowestAvg = 100
      for (const [topic, scores] of topicMap) {
        const topicAvg = scores.reduce((a, b) => a + b, 0) / scores.length
        if (topicAvg < lowestAvg) {
          lowestAvg = topicAvg
          weakestTopic = topic
        }
      }

      const riskFactors: string[] = []
      if (trendDirection === "declining") riskFactors.push("declining_grades")
      if (daysSinceLastActivity >= 14) riskFactors.push("inactive_14d")
      if (masteryLevel === "beginner" || masteryLevel === "developing") riskFactors.push("low_mastery")

      const activityCount = activityByUser.get(user.id) ?? 0
      if (activityCount < 2) riskFactors.push("low_activity")

      if (riskFactors.length === 0) continue

      let riskScore = 0
      if (trendDirection === "declining") riskScore += 30
      if (daysSinceLastActivity >= 14) riskScore += 25
      if (masteryLevel === "beginner") riskScore += 25
      else if (masteryLevel === "developing") riskScore += 15
      if (activityCount < 2) riskScore += 20

      atRiskStudents.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        avgScore,
        trendDirection,
        masteryLevel,
        daysSinceLastActivity,
        riskFactors,
        riskScore,
        lastGradeDate,
        totalAssessments: grades.length,
        weakestTopic,
      })
    }

    atRiskStudents.sort((a, b) => b.riskScore - a.riskScore)

    const factorCounts = new Map<string, number>()
    for (const student of atRiskStudents) {
      for (const factor of student.riskFactors) {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1)
      }
    }
    let mostCommonRiskFactor = "none"
    let maxCount = 0
    for (const [factor, count] of factorCounts) {
      if (count > maxCount) {
        maxCount = count
        mostCommonRiskFactor = factor
      }
    }

    const criticalCount = atRiskStudents.filter((s) => s.riskScore >= 70).length
    const warningCount = atRiskStudents.filter((s) => s.riskScore >= 40 && s.riskScore < 70).length
    const infoCount = atRiskStudents.filter((s) => s.riskScore < 40).length

    return adminJson({
      success: true,
      data: {
        atRiskStudents,
        summary: {
          totalAtRisk: atRiskStudents.length,
          criticalCount,
          warningCount,
          infoCount,
          mostCommonRiskFactor,
        },
      },
    })
  } catch (error) {
    logger.error("Failed to generate at-risk report", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
