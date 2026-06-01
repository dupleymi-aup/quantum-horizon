import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const logger = createLogger("api:sessions")

const sessionSchema = z.object({
  durationSec: z.number().min(0).max(86400),
  topic: z.string().max(200).nullable().optional(),
})

async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()

    const validationResult = sessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { durationSec, topic } = validationResult.data

    await db.userSession.create({
      data: {
        userId: session.user.id,
        durationSec,
        topic,
        startedAt: new Date(Date.now() - durationSec * 1000),
        endedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error saving session:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}

async function GETHandler() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await db.userSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 20,
      select: {
        id: true,
        topic: true,
        startedAt: true,
        endedAt: true,
        durationSec: true,
      },
    })

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    logger.error(
      "Error fetching sessions:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
