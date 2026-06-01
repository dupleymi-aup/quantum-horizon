import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z, treeifyError } from "zod"

const logger = createLogger("api:admin:exam-deadlines")

const examSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  topic: z.string().min(1).max(200),
  examDate: z.string().iso.datetime(),
  isActive: z.boolean().optional(),
})

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id == null) {
      return adminJson({ error: "Unauthorized" }, { status: 401 })
    }

    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const exams = await db.examDeadline.findMany({
      orderBy: [{ examDate: "desc" }],
    })

    return adminJson({ success: true, data: exams })
  } catch (error) {
    logger.error("Failed to fetch exam deadlines", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const validationResult = examSchema.safeParse(body)
    if (!validationResult.success) {
      return adminJson(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { title, description, topic, examDate, isActive } = validationResult.data

    const exam = await db.examDeadline.create({
      data: {
        title,
        description,
        topic,
        examDate: new Date(examDate),
        createdBy: authResult.userId,
        isActive: isActive ?? true,
      },
    })

    return adminJson({ success: true, data: exam }, { status: 201 })
  } catch (error) {
    logger.error("Failed to create exam deadline", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

async function PATCHHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return adminJson({ error: "Missing id parameter" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const validationResult = examSchema.partial().safeParse(body)
    if (!validationResult.success) {
      return adminJson(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { title, description, topic, examDate, isActive } = validationResult.data

    const existing = await db.examDeadline.findUnique({ where: { id } })
    if (!existing) {
      return adminJson({ error: "Not found" }, { status: 404 })
    }

    const updated = await db.examDeadline.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(topic !== undefined && { topic }),
        ...(examDate !== undefined && { examDate: new Date(examDate) }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return adminJson({ success: true, data: updated })
  } catch (error) {
    logger.error("Failed to update exam deadline", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

async function DELETEHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return adminJson({ error: "Missing id parameter" }, { status: 400 })
    }

    const existing = await db.examDeadline.findUnique({ where: { id } })
    if (!existing) {
      return adminJson({ error: "Not found" }, { status: 404 })
    }

    await db.examDeadline.delete({ where: { id } })
    return adminJson({ success: true })
  } catch (error) {
    logger.error("Failed to delete exam deadline", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
export const PATCH = withCsrf(withRateLimit(PATCHHandler))
export const DELETE = withCsrf(withRateLimit(DELETEHandler))
