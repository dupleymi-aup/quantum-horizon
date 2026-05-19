import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:reports:student-performance")

type MasteryLevel = "beginner" | "developing" | "proficient" | "advanced"

function getMasteryLevel(avgScore: number): MasteryLevel {
  if (avgScore >= 85) return "advanced"
  if (avgScore >= 70) return "proficient"
  if (avgScore >= 50) return "developing"
  return "beginner"
}

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return adminJson({ error: "userId is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    if (!user) {
      return adminJson({ error: "User not found" }, { status: 404 })
    }

    const grades = await db.grade.findMany({
      where: { userId },
      include: {
        assessment: { select: { title: true, topic: true, maxScore: true } },
      },
      orderBy: { completedAt: "asc" },
    })

    const allTopicScores = await db.grade.findMany({
      include: { assessment: { select: { topic: true } } },
    })

    const topicClassAvgMap = new Map<string, number[]>()
    for (const g of allTopicScores) {
      const topic = g.assessment.topic
      const existing = topicClassAvgMap.get(topic) ?? []
      existing.push(Math.round((g.score / g.maxScore) * 100))
      topicClassAvgMap.set(topic, existing)
    }
    const topicClassAvg = new Map<string, number>()
    for (const [topic, scores] of topicClassAvgMap) {
      topicClassAvg.set(topic, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
    }

    if (grades.length === 0) {
      return adminJson({
        success: true,
        data: {
          student: { id: user.id, name: user.name, email: user.email, registeredAt: user.createdAt.toISOString() },
          overall: { avgScore: 0, bestScore: 0, worstScore: 0, totalTaken: 0, totalXp: 0, activityCount: 0, overallMastery: "beginner" as MasteryLevel },
          timeline: [],
          byTopic: [],
          classPercentile: null,
          weakestTopic: null,
          strongestTopic: null,
          trendDirection: "stable",
        },
      })
    }

    const percentages = grades.map((g) => Math.round((g.score / g.maxScore) * 100))
    const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    const bestScore = Math.max(...percentages)
    const worstScore = Math.min(...percentages)

    const userActivities = await db.userActivity.aggregate({
      where: { userId },
      _sum: { xpGained: true },
      _count: true,
    })

    const totalXp = userActivities._sum.xpGained ?? 0
    const activityCount = userActivities._count

    const timeline = grades.map((g, i) => ({
      date: g.completedAt.toISOString().split("T")[0],
      score: percentages[i],
      topic: g.assessment.topic,
      assessment: g.assessment.title,
    }))

    const topicMap = new Map<string, { scores: number[]; assessments: string[]; dates: string[] }>()
    for (let i = 0; i < grades.length; i++) {
      const topic = grades[i].assessment.topic
      const existing = topicMap.get(topic) ?? { scores: [], assessments: [], dates: [] }
      existing.scores.push(percentages[i])
      existing.assessments.push(grades[i].assessment.title)
      existing.dates.push(grades[i].completedAt.toISOString().split("T")[0])
      topicMap.set(topic, existing)
    }

    const byTopic = Array.from(topicMap.entries())
      .map(([topic, d]) => {
        const firstScore = d.scores[0]
        const latestScore = d.scores[d.scores.length - 1]
        const avgTopicScore = Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length)
        const classAvg = topicClassAvg.get(topic) ?? 0
        const vsClassAvg = avgTopicScore - classAvg
        return {
          topic,
          firstScore,
          latestScore,
          improvement: latestScore - firstScore,
          avgScore: avgTopicScore,
          assessmentsTaken: d.scores.length,
          mastery: getMasteryLevel(avgTopicScore),
          classAvg,
          vsClassAvg,
        }
      })
      .sort((a, b) => b.avgScore - a.avgScore)

    const allStudentAvgs = new Map<string, number[]>()
    for (const g of allTopicScores) {
      const sId = g.userId
      const existingScores = allStudentAvgs.get(sId) ?? []
      existingScores.push(Math.round((g.score / g.maxScore) * 100))
      allStudentAvgs.set(sId, existingScores)
    }
    const studentOverallAvgs = Array.from(allStudentAvgs.entries())
      .map(([sId, scores]) => ({
        userId: sId,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => b.avg - a.avg)

    const userRank = studentOverallAvgs.findIndex((s) => s.userId === userId)
    const classPercentile = studentOverallAvgs.length > 0
      ? Math.round(((studentOverallAvgs.length - userRank - 1) / studentOverallAvgs.length) * 100)
      : null

    const strongestTopic = byTopic.length > 0 ? byTopic[0] : null
    const weakestTopic = byTopic.length > 0 ? byTopic[byTopic.length - 1] : null

    const firstHalfAvg = timeline.slice(0, Math.ceil(timeline.length / 2)).reduce((a, b) => a + b.score, 0) / Math.ceil(timeline.length / 2)
    const secondHalfAvg = timeline.slice(Math.ceil(timeline.length / 2)).reduce((a, b) => a + b.score, 0) / Math.floor(timeline.length / 2)
    const trendDirection = timeline.length < 2
      ? "stable"
      : secondHalfAvg > firstHalfAvg + 5
        ? "improving"
        : secondHalfAvg < firstHalfAvg - 5
          ? "declining"
          : "stable"

    return adminJson({
      success: true,
      data: {
        student: { id: user.id, name: user.name, email: user.email, registeredAt: user.createdAt.toISOString() },
        overall: {
          avgScore,
          bestScore,
          worstScore,
          totalTaken: grades.length,
          totalXp,
          activityCount,
          overallMastery: getMasteryLevel(avgScore),
        },
        timeline,
        byTopic,
        classPercentile,
        weakestTopic: weakestTopic ? { topic: weakestTopic.topic, avgScore: weakestTopic.avgScore, mastery: weakestTopic.mastery } : null,
        strongestTopic: strongestTopic ? { topic: strongestTopic.topic, avgScore: strongestTopic.avgScore, mastery: strongestTopic.mastery } : null,
        trendDirection,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching student performance report:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to fetch student performance report" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
