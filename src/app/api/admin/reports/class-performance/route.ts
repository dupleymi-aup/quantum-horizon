import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:reports:class-performance")

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    const authResult = requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const totalStudents = await db.user.count({ where: { role: "USER" } })
    const studentsWithGrades = await db.grade.groupBy({ by: ["userId"] })
    const gradedStudentCount = studentsWithGrades.length

    const allGrades = await db.grade.findMany({
      include: { assessment: { select: { title: true, topic: true, maxScore: true } } },
    })

    if (allGrades.length === 0) {
      return adminJson({
        success: true,
        data: {
          totalStudents,
          gradedStudentCount: 0,
          overall: { avgScore: 0, minScore: 0, maxScore: 0, totalGrades: 0, passRate: 0 },
          gradeDistribution: [],
          byTopic: [],
          topStudents: [],
          bottomStudents: [],
          mostDifficultAssessments: [],
          trendsOverTime: [],
        },
      })
    }

    const percentages = allGrades.map((g) => Math.round((g.score / g.maxScore) * 100))
    const classAvg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    const classMin = Math.min(...percentages)
    const classMax = Math.max(...percentages)
    const passCount = percentages.filter((p) => p >= 60).length
    const passRate = Math.round((passCount / percentages.length) * 100)

    const distributionBuckets = [
      { range: "0-9%", min: 0, max: 9 },
      { range: "10-19%", min: 10, max: 19 },
      { range: "20-29%", min: 20, max: 29 },
      { range: "30-39%", min: 30, max: 39 },
      { range: "40-49%", min: 40, max: 49 },
      { range: "50-59%", min: 50, max: 59 },
      { range: "60-69%", min: 60, max: 69 },
      { range: "70-79%", min: 70, max: 79 },
      { range: "80-89%", min: 80, max: 89 },
      { range: "90-100%", min: 90, max: 100 },
    ]
    const gradeDistribution = distributionBuckets.map((b) => ({
      range: b.range,
      count: percentages.filter((p) => p >= b.min && p <= b.max).length,
    }))

    const topicMap = new Map<string, { scores: number[] }>()
    for (const g of allGrades) {
      const topic = g.assessment.topic
      const existing = topicMap.get(topic) ?? { scores: [] }
      existing.scores.push(Math.round((g.score / g.maxScore) * 100))
      topicMap.set(topic, existing)
    }
    const byTopic = Array.from(topicMap.entries())
      .map(([topic, data]) => {
        const topicAvg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        const topicPassCount = data.scores.filter((s) => s >= 60).length
        return {
          topic,
          avgScore: topicAvg,
          totalAttempts: data.scores.length,
          passRate: Math.round((topicPassCount / data.scores.length) * 100),
        }
      })
      .sort((a, b) => b.avgScore - a.avgScore)

    const studentAvgsMap = new Map<string, { total: number; count: number }>()
    for (const g of allGrades) {
      const existing = studentAvgsMap.get(g.userId) ?? { total: 0, count: 0 }
      existing.total += Math.round((g.score / g.maxScore) * 100)
      existing.count++
      studentAvgsMap.set(g.userId, existing)
    }

    const users = await db.user.findMany({
      where: { id: { in: Array.from(studentAvgsMap.keys()) } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    const studentAvgs = Array.from(studentAvgsMap.entries())
      .map(([userId, data]) => {
        const user = userMap.get(userId)
        return {
          userId,
          name: user?.name ?? user?.email ?? "Unknown",
          avgScore: Math.round(data.total / data.count),
          assessmentsTaken: data.count,
        }
      })
      .sort((a, b) => b.avgScore - a.avgScore)

    const topStudents = studentAvgs.slice(0, 10)
    const bottomStudents = studentAvgs.slice(-10).reverse()

    const assessmentMap = new Map<string, { scores: number[]; title: string; topic: string }>()
    for (const g of allGrades) {
      const key = g.assessmentId
      const existing = assessmentMap.get(key) ?? { scores: [], title: g.assessment.title, topic: g.assessment.topic }
      existing.scores.push(Math.round((g.score / g.maxScore) * 100))
      assessmentMap.set(key, existing)
    }
    const mostDifficultAssessments = Array.from(assessmentMap.entries())
      .map(([_, data]) => ({
        title: data.title,
        topic: data.topic,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.scores.length,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 10)

    const dateMap = new Map<string, { total: number; count: number }>()
    for (const g of allGrades) {
      const date = g.completedAt.toISOString().split("T")[0]
      const existing = dateMap.get(date) ?? { total: 0, count: 0 }
      existing.total += Math.round((g.score / g.maxScore) * 100)
      existing.count++
      dateMap.set(date, existing)
    }
    const trendsOverTime = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        avgScore: Math.round(data.total / data.count),
        totalGrades: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return adminJson({
      success: true,
      data: {
        totalStudents,
        gradedStudentCount,
        overall: {
          avgScore: classAvg,
          minScore: classMin,
          maxScore: classMax,
          totalGrades: allGrades.length,
          passRate,
        },
        gradeDistribution,
        byTopic,
        topStudents,
        bottomStudents,
        mostDifficultAssessments,
        trendsOverTime,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching class performance report:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch class performance report" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
