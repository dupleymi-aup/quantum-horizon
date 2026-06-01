import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"
import { z } from "zod"

const logger = createLogger("api:admin:assessments")

const assessmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  topic: z.string().min(1).max(200),
  maxScore: z.number().min(1).max(1000).default(100),
})

const gradeSchema = z.object({
  assessmentId: z.string(),
  userId: z.string(),
  score: z.number().min(0),
})

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessmentId")

    if (assessmentId) {
      const grades = await db.grade.findMany({
        where: { assessmentId },
        include: {
          assessment: { select: { title: true, maxScore: true, topic: true } },
        },
      })

      const userIds = grades.map((g) => g.userId)
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
      const userMap = new Map(users.map((u) => [u.id, u]))

      const gradesWithUser = grades.map((g) => ({
        ...g,
        user: userMap.get(g.userId) ?? null,
      }))

      return NextResponse.json({ success: true, data: gradesWithUser })
    }

    const assessments = await db.assessment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { grades: true } },
      },
    })

    return NextResponse.json({ success: true, data: assessments })
  } catch (error) {
    logger.error(
      "Error fetching assessments:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const validationResult = assessmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Check if it's a grade submission
    if ("userId" in body && "score" in body) {
      const gradeResult = gradeSchema.extend({ maxScore: z.number().optional() }).safeParse(body)
      if (!gradeResult.success) {
        return NextResponse.json(
          { error: "Invalid grade input", details: gradeResult.error.issues },
          { status: 400 }
        )
      }

      const assessment = await db.assessment.findUnique({
        where: { id: gradeResult.data.assessmentId },
      })
      if (!assessment) {
        return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
      }

      const grade = await db.grade.upsert({
        where: {
          assessmentId_userId: {
            assessmentId: gradeResult.data.assessmentId,
            userId: gradeResult.data.userId,
          },
        },
        create: {
          assessmentId: gradeResult.data.assessmentId,
          userId: gradeResult.data.userId,
          score: gradeResult.data.score,
          maxScore: assessment.maxScore,
        },
        update: { score: gradeResult.data.score },
      })

      return NextResponse.json({ success: true, data: grade })
    }

    const assessment = await db.assessment.create({
      data: {
        ...validationResult.data,
        createdBy: authResult.userId,
      },
    })

    return NextResponse.json({ success: true, data: assessment })
  } catch (error) {
    logger.error(
      "Error creating assessment/grade:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
export const POST = withCsrf(withRateLimit(POSTHandler))
