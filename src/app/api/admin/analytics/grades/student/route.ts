import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:analytics:grades:student")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const grades = await db.grade.findMany({
      where: { userId },
      include: {
        assessment: { select: { title: true, topic: true, maxScore: true } },
      },
      orderBy: { completedAt: "asc" },
    })

    if (grades.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          student: { id: user.id, name: user.name, email: user.email },
          overall: { avgScore: 0, bestScore: 0, worstScore: 0, totalTaken: 0 },
          timeline: [],
          byTopic: [],
        },
      })
    }

    const percentages = grades.map((g) => Math.round((g.score / g.maxScore) * 100))
    const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    const bestScore = Math.max(...percentages)
    const worstScore = Math.min(...percentages)

    // Timeline
    const timeline = grades.map((g, i) => ({
      date: g.completedAt.toISOString().split("T")[0],
      score: percentages[i],
      topic: g.assessment.topic,
      assessment: g.assessment.title,
    }))

    // Per-topic improvement
    const topicMap = new Map<
      string,
      { scores: number[]; assessments: string[] }
    >()
    for (let i = 0; i < grades.length; i++) {
      const topic = grades[i].assessment.topic
      const existing = topicMap.get(topic) ?? { scores: [], assessments: [] }
      existing.scores.push(percentages[i])
      existing.assessments.push(grades[i].assessment.title)
      topicMap.set(topic, existing)
    }

    const byTopic = Array.from(topicMap.entries())
      .map(([topic, d]) => {
        const firstScore = d.scores[0]
        const latestScore = d.scores[d.scores.length - 1]
        const avgTopicScore = Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length)
        return {
          topic,
          firstScore,
          latestScore,
          improvement: latestScore - firstScore,
          avgScore: avgTopicScore,
          assessmentsTaken: d.scores.length,
        }
      })
      .sort((a, b) => b.avgScore - a.avgScore)

    return NextResponse.json({
      success: true,
      data: {
        student: { id: user.id, name: user.name, email: user.email },
        overall: { avgScore, bestScore, worstScore, totalTaken: grades.length },
        timeline,
        byTopic,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching student grade data:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch student grade data" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
