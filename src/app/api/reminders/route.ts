import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z, treeifyError } from "zod"

const logger = createLogger("api:reminders")

const reminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  topic: z.string().max(200).optional(),
  deadline: z.string().datetime(),
  type: z.enum(["PERSONAL", "STUDY", "EXAM"]).default("PERSONAL"),
})

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user.id ?? null
}

async function GETHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const type = searchParams.get("type") as "PERSONAL" | "STUDY" | "EXAM" | null

    const where: Record<string, unknown> = { userId }
    if (type) where.type = type
    if (upcoming) {
      where.reminded = false
      where.deadline = { gte: new Date() }
    }

    const reminders = await db.learningReminder.findMany({
      where,
      orderBy: [{ deadline: "asc" }],
    })

    return NextResponse.json({ success: true, data: reminders })
  } catch (error) {
    logger.error("Failed to fetch reminders", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function POSTHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const validationResult = reminderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { title, description, topic, deadline, type } = validationResult.data

    const reminder = await db.learningReminder.create({
      data: { userId, title, description, topic, deadline: new Date(deadline), type },
    })

    return NextResponse.json({ success: true, data: reminder }, { status: 201 })
  } catch (error) {
    logger.error("Failed to create reminder", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function PATCHHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const { reminded } = z.object({ reminded: z.boolean().optional() }).safeParse(body).data ?? {}

    const existing = await db.learningReminder.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await db.learningReminder.update({
      where: { id },
      data: {
        ...(reminded !== undefined && { reminded, reminderSentAt: reminded ? new Date() : null }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    logger.error("Failed to update reminder", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function DELETEHandler(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    const existing = await db.learningReminder.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await db.learningReminder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Failed to delete reminder", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
export const PATCH = withCsrf(withRateLimit(PATCHHandler))
export const DELETE = withCsrf(withRateLimit(DELETEHandler))
