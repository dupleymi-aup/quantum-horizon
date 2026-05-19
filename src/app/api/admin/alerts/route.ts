import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"
import { z, treeifyError } from "zod"

const logger = createLogger("api:admin:alerts")

const alertSchema = z.object({
  type: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  userId: z.string().nullable().optional(),
})

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100)

    const alerts = await db.adminAlert.findMany({
      where: unreadOnly ? { read: false } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const unreadCount = await db.adminAlert.count({ where: { read: false } })

    return adminJson({
      success: true,
      data: { alerts, unreadCount },
    })
  } catch (error) {
    logger.error("Error fetching alerts:", error instanceof Error ? error.message : "Unknown error")
    return adminJson({ error: "Failed to fetch alerts" }, { status: 500 })
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
    const validationResult = alertSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const alert = await db.adminAlert.create({ data: validationResult.data })
    return adminJson({ success: true, data: alert })
  } catch (error) {
    logger.error("Error creating alert:", error instanceof Error ? error.message : "Unknown error")
    return adminJson({ error: "Failed to create alert" }, { status: 500 })
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

    if (id) {
      await db.adminAlert.update({ where: { id }, data: { read: true } })
    } else {
      await db.adminAlert.updateMany({ where: { read: false }, data: { read: true } })
    }

    return adminJson({ success: true })
  } catch (error) {
    logger.error(
      "Error marking alerts as read:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return adminJson({ error: "Failed to update alerts" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const POST = withCsrf(withRateLimit(POSTHandler))
export const PATCH = withCsrf(withRateLimit(PATCHHandler))
