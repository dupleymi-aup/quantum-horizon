import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:admin:analytics:grades")

function calcStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const grades = await db.grade.findMany({
      where: { completedAt: { gte: ninetyDaysAgo } },
      include: {
        assessment: { select: { title: true, topic: true, maxScore: true } },
      },
      orderBy: { completedAt: "asc" },
    })

    const totalAssessments = await db.assessment.count()
    const totalGrades = grades.length

    if (totalGrades === 0) {
      return adminJson({
        success: true,
        data: {
          totalAssessments,
          totalGrades: 0,
          avgScorePercentage: 0,
          passRate: 0,
          trendsOverTime: [],
          gradeDistribution: [],
          avgByTopic: [],
          assessmentDifficulty: [],
        },
      })
    }

    const percentages = grades.map((g) => (g.score / g.maxScore) * 100)
    const avgScorePercentage =
      Math.round((percentages.reduce((a, b) => a + b, 0) / totalGrades) * 10) / 10
    const passCount = percentages.filter((p) => p >= 60).length
    const passRate = Math.round((passCount / totalGrades) * 1000) / 10

    // Trends over time
    const dailyMap = new Map<string, { total: number; count: number }>()
    for (let i = 0; i < grades.length; i++) {
      const g = grades[i]
      const pct = percentages[i]
      const date = g.completedAt.toISOString().split("T")[0]
      const existing = dailyMap.get(date) ?? { total: 0, count: 0 }
      existing.total += pct
      existing.count++
      dailyMap.set(date, existing)
    }

    const trendsOverTime = Array.from(dailyMap.entries())
      .map(([date, d]) => ({
        date,
        avgScore: Math.round((d.total / d.count) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Grade distribution buckets
    const bucketCounts = Array(11).fill(0) as number[]
    for (const pct of percentages) {
      const idx = Math.min(Math.floor(pct / 10), 10)
      bucketCounts[idx]++
    }
    const gradeDistribution = bucketCounts.map((count, i) => ({
      range: i === 10 ? "100" : `${String(i * 10)}-${String(i * 10 + 9)}`,
      count,
    }))

    // Average by topic
    const topicMap = new Map<string, { total: number; count: number }>()
    for (let i = 0; i < grades.length; i++) {
      const topic = grades[i].assessment.topic
      const existing = topicMap.get(topic) ?? { total: 0, count: 0 }
      existing.total += percentages[i]
      existing.count++
      topicMap.set(topic, existing)
    }
    const avgByTopic = Array.from(topicMap.entries())
      .map(([topic, d]) => ({
        topic,
        avgScore: Math.round((d.total / d.count) * 10) / 10,
        count: d.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)

    // Assessment difficulty
    const assessmentMap = new Map<string, { scores: number[]; title: string; topic: string }>()
    for (let i = 0; i < grades.length; i++) {
      const g = grades[i]
      const key = g.assessmentId
      const existing = assessmentMap.get(key) ?? {
        scores: [],
        title: g.assessment.title,
        topic: g.assessment.topic,
      }
      existing.scores.push(percentages[i])
      assessmentMap.set(key, existing)
    }
    const assessmentDifficulty = Array.from(assessmentMap.entries())
      .map(([, d]) => ({
        title: d.title,
        topic: d.topic,
        avgScore: Math.round((d.scores.reduce((a, b) => a + b, 0) / d.scores.length) * 10) / 10,
        count: d.scores.length,
        stdDev: Math.round(calcStdDev(d.scores) * 10) / 10,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)

    return adminJson({
      success: true,
      data: {
        totalAssessments,
        totalGrades,
        avgScorePercentage,
        passRate,
        trendsOverTime,
        gradeDistribution,
        avgByTopic,
        assessmentDifficulty,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching grade analytics:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch grade analytics" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
