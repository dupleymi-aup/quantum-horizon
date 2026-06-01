/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { z } from "zod"
import { requireTeacherRole } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:teacher:assessments")

const createAssessmentSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  topic: z.string(),
  maxScore: z.number().int().positive().default(100),
})

const gradeSchema = z.object({
  assessmentId: z.string(),
  userId: z.string(),
  score: z.number().int().min(0),
})

/**
 * GET /api/teacher/assessments
 * Получение списка assessments, созданных преподавателем
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

    const assessments = await db.assessment.findMany({
      where: { createdBy: authCheck.userId },
      include: {
        grades: {
          select: {
            id: true,
            userId: true,
            score: true,
            maxScore: true,
            completedAt: true,
          },
        },
        _count: {
          select: { grades: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      assessments: assessments.map((a) => ({
        ...a,
        gradesCount: a._count.grades,
        _count: undefined,
      })),
      total: assessments.length,
    })
  } catch (error) {
    logger.error("Get assessments error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Ошибка при получении тестов" }, { status: 500 })
  }
}

/**
 * POST /api/teacher/assessments
 * Создание нового теста преподавателем
 */
async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireTeacherRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const validation = createAssessmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 }
      )
    }

    const { title, description, topic, maxScore } = validation.data

    const assessment = await db.assessment.create({
      data: {
        title,
        description: description ?? null,
        topic,
        maxScore,
        createdBy: authCheck.userId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        assessment,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error(
      "Create assessment error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Ошибка при создании теста" }, { status: 500 })
  }
}

/**
 * PATCH /api/teacher/assessments
 * Обновление теста преподавателем (ID в body)
 */
async function PATCHHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireTeacherRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID обязателен" }, { status: 400 })
    }

    const validation = createAssessmentSchema.partial().safeParse(updateData)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 }
      )
    }

    // Проверка что assessment принадлежит преподавателю
    const existing = await db.assessment.findUnique({
      where: { id },
      select: { createdBy: true },
    })

    if (existing?.createdBy !== authCheck.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await db.assessment.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json({
      success: true,
      assessment: updated,
    })
  } catch (error) {
    logger.error(
      "Update assessment error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Ошибка при обновлении теста" }, { status: 500 })
  }
}

/**
 * DELETE /api/teacher/assessments
 * Удаление теста преподавателем (ID в body)
 */
async function DELETEHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireTeacherRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID обязателен" }, { status: 400 })
    }

    // Проверка что assessment принадлежит преподавателю
    const existing = await db.assessment.findUnique({
      where: { id },
      select: { createdBy: true },
    })

    if (existing?.createdBy !== authCheck.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await db.assessment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(
      "Delete assessment error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Ошибка при удалении теста" }, { status: 500 })
  }
}

/**
 * POST /api/teacher/assessments/grade
 * Выставление оценки студенту
 */
async function GradeHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireTeacherRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const validation = gradeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 }
      )
    }

    const { assessmentId, userId, score } = validation.data

    // Проверка что assessment принадлежит преподавателю
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: { createdBy: true, maxScore: true },
    })

    if (assessment?.createdBy !== authCheck.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (score > assessment.maxScore) {
      return NextResponse.json(
        { error: `Балл не может превышать ${String(assessment.maxScore)}` },
        { status: 400 }
      )
    }

    const grade = await db.grade.upsert({
      where: {
        assessmentId_userId: { assessmentId, userId },
      },
      create: {
        assessmentId,
        userId,
        score,
        maxScore: assessment.maxScore,
      },
      update: {
        score,
        maxScore: assessment.maxScore,
      },
    })

    return NextResponse.json({
      success: true,
      grade,
    })
  } catch (error) {
    logger.error("Grade error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Ошибка при выставлении оценки" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
export const POST = withCsrf(withRateLimit(POSTHandler))
export const PATCH = withCsrf(withRateLimit(PATCHHandler))
export const DELETE = withCsrf(withRateLimit(DELETEHandler))
export const PUT = withCsrf(withRateLimit(GradeHandler))
