import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { withCsrf } from "@/lib/csrf"
import { withRateLimit } from "@/lib/rate-limit"
import { z, treeifyError } from "zod"

const logger = createLogger("api:sessions")

const sessionSchema = z.object({
  durationSec: z.number().min(0).max(86400),
  topic: z.string().max(200).nullable().optional(),
})

async function POSTHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json()

    const validationResult = sessionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { durationSec, topic } = validationResult.data

    await db.userSession.create({
      data: {
        userId: session.user.id,
        durationSec,
        topic,
        endedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(
      "Error saving session:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}

export const POST = withCsrf(withRateLimit(POSTHandler))
