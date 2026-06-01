import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAnyRole } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:student:groups")

/**
 * GET /api/student/groups
 * Получение списка групп, в которых состоит студент
 */
async function GETHandler(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const authCheck = await requireAnyRole(session)

    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const memberships = await db.studentGroupMember.findMany({
      where: { userId: authCheck.userId },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      groups: memberships.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        description: m.group.description,
        memberCount: m.group._count.members,
        createdAt: m.group.createdAt,
      })),
      total: memberships.length,
    })
  } catch (error) {
    logger.error("Get groups error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Ошибка при получении групп" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
