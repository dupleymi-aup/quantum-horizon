import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"
import { z, treeifyError } from "zod"

const logger = createLogger("api:admin:groups")

const groupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  memberIds: z.array(z.string()).default([]),
})

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("id")

    if (groupId) {
      const group = await db.studentGroup.findUnique({
        where: { id: groupId },
        include: {
          members: true,
        },
      })

      if (group) {
        const userIds = group.members.map((m) => m.userId)
        const users = await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
        const userMap = new Map(users.map((u) => [u.id, u]))
        const groupWithUsers = {
          ...group,
          members: group.members.map((m) => ({
            ...m,
            user: userMap.get(m.userId) ?? null,
          })),
        }
        return NextResponse.json({ success: true, data: groupWithUsers })
      }
      return NextResponse.json({ success: true, data: group })
    }

    const groups = await db.studentGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true } },
      },
    })

    return NextResponse.json({ success: true, data: groups })
  } catch (error) {
    logger.error("Error fetching groups:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
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
    const validationResult = groupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: treeifyError(validationResult.error) },
        { status: 400 }
      )
    }

    const { memberIds, ...groupData } = validationResult.data

    const group = await db.studentGroup.create({
      data: {
        ...groupData,
        createdBy: authResult.userId,
        members: {
          create: memberIds.map((userId: string) => ({ userId })),
        },
      },
      include: {
        members: true,
      },
    })

    const userIds = group.members.map((m) => m.userId)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))
    const groupWithUsers = {
      ...group,
      members: group.members.map((m) => ({
        ...m,
        user: userMap.get(m.userId) ?? null,
      })),
    }

    return NextResponse.json({ success: true, data: groupWithUsers })
  } catch (error) {
    logger.error("Error creating group:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}

async function DELETEHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (id && userId) {
      await db.studentGroupMember.deleteMany({
        where: { groupId: id, userId },
      })
      return NextResponse.json({ success: true })
    }

    if (id) {
      await db.studentGroup.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
  } catch (error) {
    logger.error("Error deleting:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

export const GET = withCsrf(withRateLimit(GETHandler))
export const POST = withCsrf(withRateLimit(POSTHandler))
export const DELETE = withCsrf(withRateLimit(DELETEHandler))
