/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireTeacherRole } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:teacher:dashboard")

/**
 * GET /api/teacher/dashboard
 * Панель преподавателя: статистика, студенты, оценки
 */
async function GETHandler(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireTeacherRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const teacherId = authCheck.userId

    // Количество созданных тестов
    const assessmentsCount = await db.assessment.count({
      where: { createdBy: teacherId },
    })

    // Количество выставленных оценок
    const gradesCount = await db.grade.count({
      where: {
        assessment: {
          createdBy: teacherId,
        },
      },
    })

    // Средний балл по всем тестам преподавателя
    const avgGrade = await db.grade.aggregate({
      where: {
        assessment: {
          createdBy: teacherId,
        },
      },
      _avg: {
        score: true,
      },
    })

    // Уникальные студенты, которым выставлены оценки
    const uniqueStudents = await db.grade.groupBy({
      by: ["userId"],
      where: {
        assessment: {
          createdBy: teacherId,
        },
      },
    })

    // Последние оценки
    const recentGrades = await db.grade.findMany({
      where: {
        assessment: {
          createdBy: teacherId,
        },
      },
      include: {
        assessment: {
          select: { title: true, topic: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    })

    // Топ темы по количеству тестов
    const topTopics = await db.assessment.groupBy({
      by: ["topic"],
      where: { createdBy: teacherId },
      _count: { topic: true },
      orderBy: { _count: { topic: "desc" } },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        assessmentsCount,
        gradesCount,
        avgScore: avgGrade.score ?? 0,
        uniqueStudentsCount: uniqueStudents.length,
      },
      recentGrades: recentGrades.map((g) => ({
        id: g.id,
        studentName: g.user.name ?? g.user.email ?? "Unknown",
        assessmentTitle: g.assessment.title,
        topic: g.assessment.topic,
        score: g.score,
        maxScore: g.maxScore,
        percentage: Math.round((g.score / g.maxScore) * 100),
        completedAt: g.completedAt,
      })),
      topTopics: topTopics.map((t) => ({
        topic: t.topic,
        count: t._count.topic,
      })),
    })
  } catch (error) {
    logger.error(
      "Teacher dashboard error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Ошибка при загрузке данных" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
