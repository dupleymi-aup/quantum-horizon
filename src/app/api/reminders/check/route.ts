import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:reminders:check")

const EXAM_LOOKAHEAD_DAYS = 7

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const lookaheadEnd = new Date(now.getTime() + EXAM_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000)

    // Get due personal reminders (deadline passed, not yet reminded)
    const dueReminders = await db.learningReminder.findMany({
      where: {
        userId,
        deadline: { lte: now },
        reminded: false,
      },
      orderBy: [{ deadline: "asc" }],
    })

    // Mark them as reminded
    if (dueReminders.length > 0) {
      await db.learningReminder.updateMany({
        where: { id: { in: dueReminders.map((r) => r.id) } },
        data: { reminded: true, reminderSentAt: now },
      })
    }

    // Get upcoming active exams (within lookahead window)
    const upcomingExams = await db.examDeadline.findMany({
      where: {
        isActive: true,
        examDate: { gte: now, lte: lookaheadEnd },
      },
      orderBy: [{ examDate: "asc" }],
    })

    // Filter out dismissed exams (unless snooze has passed)
    const dismissals = await db.reminderDismissal.findMany({
      where: { userId, examDeadlineId: { in: upcomingExams.map((e) => e.id) } },
    })

    const dismissedIds = new Set(
      dismissals
        .filter((d) => !d.snoozeUntil || d.snoozeUntil > now)
        .map((d) => d.examDeadlineId)
    )

    const filteredExams = upcomingExams.filter((e) => !dismissedIds.has(e.id))

    const totalUnread = dueReminders.length + filteredExams.length

    return NextResponse.json({
      success: true,
      data: {
        dueReminders,
        upcomingExams: filteredExams,
        unreadCount: totalUnread,
      },
    })
  } catch (error) {
    logger.error("Failed to check reminders", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
