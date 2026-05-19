import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { requireAdminRole, isAuthError } from "@/lib/auth-helpers"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"

const logger = createLogger("api:admin:reports:group-comparison")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const authResult = await requireAdminRole(session)
    if (isAuthError(authResult)) {
      return adminJson({ error: authResult.error }, { status: authResult.status })
    }

    const groups = await db.studentGroup.findMany({
      include: {
        members: { select: { userId: true } },
      },
    })

    if (groups.length === 0) {
      return adminJson({ success: true, data: { groups: [] } })
    }

    const allUserIds = groups.flatMap((g) => g.members.map((m) => m.userId))
    const uniqueUserIds = [...new Set(allUserIds)]
    const users = await db.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, name: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u.name]))

    const allGrades = await db.grade.findMany({
      include: {
        assessment: { select: { topic: true, maxScore: true } },
      },
    })

    const groupResults = []

    for (const group of groups) {
      const memberIds = group.members.map((m) => m.userId)
      const memberCount = memberIds.length

      const groupGrades = allGrades.filter((g) => memberIds.includes(g.userId))

      if (groupGrades.length === 0) {
        groupResults.push({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount,
          avgScore: 0,
          passRate: 0,
          totalGrades: 0,
          activeStudents: 0,
          byTopic: [],
          trendsOverTime: [],
        })
        continue
      }

      const percentages = groupGrades.map((g) => Math.round((g.score / g.maxScore) * 100))
      const avgScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      const passRate = Math.round((percentages.filter((s) => s >= 60).length / percentages.length) * 100)

      const activeStudentIds = new Set(groupGrades.map((g) => g.userId))
      const activeStudents = activeStudentIds.size

      const topicMap = new Map<string, number[]>()
      for (let i = 0; i < groupGrades.length; i++) {
        const topic = groupGrades[i].assessment.topic
        if (!topicMap.has(topic)) {
          topicMap.set(topic, [])
        }
        topicMap.get(topic)!.push(percentages[i])
      }

      const byTopic = Array.from(topicMap.entries()).map(([topic, scores]) => ({
        topic,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        passRate: Math.round((scores.filter((s) => s >= 60).length / scores.length) * 100),
      }))

      const dateMap = new Map<string, number[]>()
      for (let i = 0; i < groupGrades.length; i++) {
        const dateKey = groupGrades[i].completedAt.toISOString().split("T")[0]
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, [])
        }
        dateMap.get(dateKey)!.push(percentages[i])
      }

      const trendsOverTime = Array.from(dateMap.entries())
        .map(([date, scores]) => ({
          date,
          avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      groupResults.push({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount,
        avgScore,
        passRate,
        totalGrades: groupGrades.length,
        activeStudents,
        byTopic,
        trendsOverTime,
      })
    }

    return adminJson({
      success: true,
      data: { groups: groupResults },
    })
  } catch (error) {
    logger.error("Failed to generate group comparison report", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
