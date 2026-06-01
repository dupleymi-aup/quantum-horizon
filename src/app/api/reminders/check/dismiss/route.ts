/* eslint-disable @typescript-eslint/no-deprecated */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const logger = createLogger("api:reminders:dismiss")

const dismissSchema = z.object({
  examDeadlineId: z.string().min(1),
  snoozeUntil: z.string().datetime().optional(),
})

async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()
    const validationResult = dismissSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { examDeadlineId, snoozeUntil } = validationResult.data

    // Verify exam exists
    const exam = await db.examDeadline.findUnique({ where: { id: examDeadlineId } })
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Upsert dismissal
    await db.reminderDismissal.upsert({
      where: { userId_examDeadlineId: { userId, examDeadlineId } },
      create: { userId, examDeadlineId, snoozeUntil: snoozeUntil ? new Date(snoozeUntil) : null },
      update: {
        dismissedAt: new Date(),
        snoozeUntil: snoozeUntil ? new Date(snoozeUntil) : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Failed to dismiss reminder", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withCsrf(withRateLimit(POSTHandler))
