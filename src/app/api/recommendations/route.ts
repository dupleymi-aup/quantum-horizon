import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { getRecommendations } from "@/lib/recommendations"

const logger = createLogger("api:recommendations")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      // Return generic recommendations for unauthenticated users
      const generic = getRecommendations({
        completedTopics: [],
        bookmarkedTopics: [],
        lowScoreTopics: [],
      })
      return NextResponse.json({
        success: true,
        data: generic.map((r) => ({
          topic: r.viz.id,
          category: r.viz.category,
          difficulty: r.viz.difficulty,
          reason: r.reason,
        })),
      })
    }

    const userId = session.user.id

    // Get completed topics
    const progress = await db.userProgress.findMany({
      where: { userId, completedCount: { gte: 1 } },
      select: { topic: true },
    })
    const completedTopics = progress.map((p) => p.topic)

    // Get bookmarked topics
    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      select: { topic: true },
    })
    const bookmarkedTopics = bookmarks.map((b) => b.topic)

    // Get low-score topics (grades < 60%)
    const grades = await db.grade.findMany({
      where: { userId },
      include: { assessment: { select: { maxScore: true, topic: true } } },
    })

    const topicScores: Record<string, number[]> = {}
    for (const g of grades) {
      const topic = g.assessment.topic ?? "unknown"
      if (!topicScores[topic]) topicScores[topic] = []
      topicScores[topic].push((g.score / g.assessment.maxScore) * 100)
    }

    const lowScoreTopics = Object.entries(topicScores)
      .filter(([, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        return avg < 60
      })
      .map(([topic]) => topic)

    const recommendations = getRecommendations({
      completedTopics,
      bookmarkedTopics,
      lowScoreTopics,
    })

    return NextResponse.json({
      success: true,
      data: recommendations.map((r) => ({
        topic: r.viz.id,
        category: r.viz.category,
        difficulty: r.viz.difficulty,
        estimatedTimeMin: r.viz.estimatedTimeMin,
        reason: r.reason,
        score: r.score,
      })),
    })
  } catch (error) {
    logger.error("Failed to generate recommendations", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
