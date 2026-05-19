import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:user:dashboard")

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1
}

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const [progress, achievements, activities, sessionAgg, gradeData] = await Promise.all([
      db.userProgress.findMany({
        where: { userId },
        orderBy: { lastCompleted: "desc" },
        select: {
          id: true,
          topic: true,
          completedCount: true,
          lastCompleted: true,
        },
      }),
      db.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: "desc" },
        select: {
          id: true,
          achievementId: true,
          progress: true,
          target: true,
          unlockedAt: true,
        },
      }),
      db.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          action: true,
          topic: true,
          xpGained: true,
          createdAt: true,
        },
      }),
      db.userSession.aggregate({
        where: { userId },
        _sum: { durationSec: true },
        _count: true,
      }),
      db.grade.findMany({
        where: { userId },
        include: {
          assessment: { select: { title: true, topic: true, maxScore: true } },
        },
        orderBy: { completedAt: "desc" },
      }),
    ])

    const totalXP = activities.reduce((sum, a) => sum + a.xpGained, 0)
    const level = calculateLevel(totalXP)
    const completedTopics = progress.filter((p) => p.completedCount >= 1).length
    const totalStudyMinutes = Math.round((sessionAgg._sum.durationSec ?? 0) / 60)

    const unlockedAchievements = achievements.filter((a) => a.progress >= a.target)
    const inProgressAchievements = achievements.filter((a) => a.progress < a.target)

    const recentActivity = activities.slice(0, 10)

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weeklyActivity = activities.filter((a) => new Date(a.createdAt) >= sevenDaysAgo)

    const xpByDay: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      xpByDay[d.toISOString().slice(0, 10)] = 0
    }
    for (const act of weeklyActivity) {
      const day = act.createdAt.toISOString().slice(0, 10)
      xpByDay[day] = (xpByDay[day] ?? 0) + act.xpGained
    }
    const xpTrend = Object.entries(xpByDay).map(([date, xp]) => ({ date, xp }))

    const gradesByTopic: Record<string, { scores: number[]; maxScores: number[] }> = {}
    for (const g of gradeData) {
      const topic = g.assessment.topic
      gradesByTopic[topic] ??= { scores: [], maxScores: [] }
      gradesByTopic[topic].scores.push(g.score)
      gradesByTopic[topic].maxScores.push(g.maxScore)
    }

    const topicGrades = Object.entries(gradesByTopic).map(([topic, data]) => {
      const percentages = data.scores.map((s, i) => (s / data.maxScores[i]) * 100)
      const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      return { topic, avgScore, assessmentsTaken: data.scores.length }
    })

    const allPercentages = gradeData.map(
      (g) => (g.score / g.maxScore) * 100
    )
    const overallGradeAvg =
      allPercentages.length > 0
        ? Math.round(allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length)
        : null

    const weeklySessions = weeklyActivity.filter((a) => a.action === "study_session").length

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          level,
          totalXP,
          xpToNextLevel: level * 500,
          completedTopics,
          totalStudyMinutes,
          totalSessions: sessionAgg._count,
          weeklySessions,
          achievementsUnlocked: unlockedAchievements.length,
          achievementsInProgress: inProgressAchievements.length,
          assessmentsTaken: gradeData.length,
          overallGradeAvg,
        },
        progress: progress.map((p) => ({
          id: p.id,
          topic: p.topic,
          completedCount: p.completedCount,
          lastCompleted: p.lastCompleted.toISOString(),
        })),
        achievements: achievements.map((a) => ({
          id: a.id,
          achievementId: a.achievementId,
          progress: a.progress,
          target: a.target,
          unlocked: a.progress >= a.target,
          unlockedAt: a.unlockedAt.toISOString(),
        })),
        recentActivity: recentActivity.map((a) => ({
          id: a.id,
          action: a.action,
          topic: a.topic,
          xpGained: a.xpGained,
          createdAt: a.createdAt.toISOString(),
        })),
        xpTrend,
        topicGrades,
      },
    })
  } catch (error) {
    logger.error(
      "Error fetching dashboard:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
