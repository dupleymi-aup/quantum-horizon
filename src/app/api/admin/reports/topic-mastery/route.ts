import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:reports:topic-mastery")

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
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const grades = await db.grade.findMany({
      include: {
        assessment: { select: { title: true, topic: true, maxScore: true } },
      },
      orderBy: { completedAt: "asc" },
    })

    if (grades.length === 0) {
      return adminJson({
        success: true,
        data: {
          topics: [],
          overallMasteryDistribution: { advanced: 0, proficient: 0, developing: 0, beginner: 0 },
        },
      })
    }

    const userIds = [...new Set(grades.map((g) => g.userId))]

    const topicStudentScores = new Map<string, Map<string, number[]>>()
    const topicTrendData = new Map<string, Map<string, number[]>>()

    for (const g of grades) {
      const topic = g.assessment.topic
      const userId = g.userId
      const pct = Math.round((g.score / g.maxScore) * 100)

      if (!topicStudentScores.has(topic)) {
        topicStudentScores.set(topic, new Map())
      }
      const studentMap = topicStudentScores.get(topic)!
      if (!studentMap.has(userId)) {
        studentMap.set(userId, [])
      }
      studentMap.get(userId)!.push(pct)

      const dateKey = g.completedAt.toISOString().split("T")[0]
      if (!topicTrendData.has(topic)) {
        topicTrendData.set(topic, new Map())
      }
      const dateMap = topicTrendData.get(topic)!
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, [])
      }
      dateMap.get(dateKey)!.push(pct)
    }

    const overallMasteryDistribution: Record<MasteryLevel, number> = {
      advanced: 0,
      proficient: 0,
      developing: 0,
      beginner: 0,
    }

    const studentAvgs = new Map<string, number[]>()
    for (const g of grades) {
      const userId = g.userId
      const pct = Math.round((g.score / g.maxScore) * 100)
      if (!studentAvgs.has(userId)) {
        studentAvgs.set(userId, [])
      }
      studentAvgs.get(userId)!.push(pct)
    }
    for (const [, scores] of studentAvgs) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const level = getMasteryLevel(avg)
      overallMasteryDistribution[level]++
    }

    const topics = []

    for (const [topic, studentMap] of topicStudentScores) {
      const masteryDistribution: Record<MasteryLevel, number> = {
        advanced: 0,
        proficient: 0,
        developing: 0,
        beginner: 0,
      }

      const allTopicScores: number[] = []
      for (const [, scores] of studentMap) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        const level = getMasteryLevel(avg)
        masteryDistribution[level]++
        allTopicScores.push(...scores)
      }

      const avgScore = Math.round(allTopicScores.reduce((a, b) => a + b, 0) / allTopicScores.length)
      const totalStudents = studentMap.size
      const passCount = allTopicScores.filter((s) => s >= 60).length
      const passRate = Math.round((passCount / allTopicScores.length) * 100)

      const trendData = topicTrendData.get(topic)!
      const trend = Array.from(trendData.entries())
        .map(([date, scores]) => ({
          date,
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const assessmentScores = new Map<string, number[]>()
      for (const g of grades) {
        if (g.assessment.topic === topic) {
          const pct = Math.round((g.score / g.maxScore) * 100)
          if (!assessmentScores.has(g.assessment.title)) {
            assessmentScores.set(g.assessment.title, [])
          }
          assessmentScores.get(g.assessment.title)!.push(pct)
        }
      }
      const weakestAssessments = Array.from(assessmentScores.entries())
        .map(([title, scores]) => ({
          title,
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        }))
        .sort((a, b) => a.avgScore - b.avgScore)
        .slice(0, 5)

      topics.push({
        topic,
        masteryDistribution,
        avgScore,
        totalStudents,
        passRate,
        trend,
        weakestAssessments,
      })
    }

    topics.sort((a, b) => a.avgScore - b.avgScore)

    return adminJson({
      success: true,
      data: {
        topics,
        overallMasteryDistribution,
      },
    })
  } catch (error) {
    logger.error("Failed to generate topic mastery report", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
