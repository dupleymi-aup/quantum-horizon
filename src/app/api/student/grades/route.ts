import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAnyRole } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:student:grades")

/**
 * GET /api/student/grades
 * Получение списка оценок студента
 */
async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireAnyRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic")

    const where = {
      userId: authCheck.userId,
      ...(topic ? { assessment: { topic } } : {}),
    }

    const grades = await db.grade.findMany({
      where,
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            topic: true,
            maxScore: true,
            createdAt: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    // Статистика
    const stats = await db.grade.aggregate({
      where: { userId: authCheck.userId },
      _avg: { score: true },
      _count: true,
      _max: { score: true },
      _min: { score: true },
    })

    // Группировка по темам
    const byTopic = await db.grade.groupBy({
      by: ["assessmentId"],
      where: { userId: authCheck.userId },
      _avg: { score: true },
      _count: true,
    })

    const topicStats = await Promise.all(
      byTopic.map(async (g) => {
        const assessment = await db.assessment.findUnique({
          where: { id: g.assessmentId },
          select: { topic: true },
        })
        return {
          topic: assessment?.topic ?? "Unknown",
          avgScore: g._avg.score ?? 0,
          count: g._count,
        }
      })
    )

    return NextResponse.json({
      grades: grades.map((g) => ({
        id: g.id,
        assessmentId: g.assessmentId,
        title: g.assessment.title,
        description: g.assessment.description,
        topic: g.assessment.topic,
        score: g.score,
        maxScore: g.maxScore,
        percentage: Math.round((g.score / g.maxScore) * 100),
        completedAt: g.completedAt,
      })),
      stats: {
        total: stats._count,
        avgScore: stats._avg.score ?? 0,
        maxScore: stats._max.score ?? 0,
        minScore: stats._min.score ?? 0,
        avgPercentage: stats._avg.score ? Math.round((stats._avg.score / 100) * 100) : 0,
      },
      byTopic: topicStats,
    })
  } catch (error) {
    logger.error("Get grades error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Ошибка при получении оценок" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
