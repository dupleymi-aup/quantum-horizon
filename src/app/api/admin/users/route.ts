import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:users")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10), 1), 100)
    const search = searchParams.get("search") ?? ""
    const role = searchParams.get("role") ?? ""
    const skip = (page - 1) * limit

    const where = {
      ...(search
        ? {
            OR: [{ name: { contains: search } }, { email: { contains: search } }],
          }
        : {}),
      ...(role ? { role: role as UserRole } : {}),
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          image: true,
        },
      }),
      db.user.count({ where }),
    ])

    const userIds = users.map((u) => u.id)
    const activityCounts = await db.userActivity.groupBy({
      by: ["userId"],
      _count: { id: true },
      _sum: { xpGained: true },
      _max: { createdAt: true },
      where: { userId: { in: userIds } },
    })

    const activityMap = new Map(
      activityCounts.map((a) => [
        a.userId,
        {
          activityCount: a._count,
          totalXp: a._sum.xpGained ?? 0,
          lastActive: a._max.createdAt?.toISOString() ?? null,
        },
      ])
    )

    const usersWithStats = users.map((u) => ({
      ...u,
      activityCount: activityMap.get(u.id)?.activityCount ?? 0,
      totalXp: activityMap.get(u.id)?.totalXp ?? 0,
      lastActive: activityMap.get(u.id)?.lastActive ?? null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error("Error fetching users:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
