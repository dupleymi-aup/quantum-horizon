/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    userActivity: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    userSession: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    userProgress: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    bookmark: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    userAchievement: {
      findMany: vi.fn(),
    },
    grade: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      upsert: vi.fn(),
    },
    assessment: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    studentGroup: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    studentGroupMember: {
      deleteMany: vi.fn(),
    },
    adminAlert: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
}))

vi.mock("@/lib/csrf", () => ({
  withCsrf: (handler: (...args: unknown[]) => unknown) => handler,
}))

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (handler: (...args: unknown[]) => unknown) => handler,
}))

vi.mock("@/lib/admin-response", () => ({
  adminJson: (data: unknown, init?: ResponseInit) => {
    const body = JSON.stringify(data)
    return new Response(body, {
      status: init?.status ?? 200,
      headers: { "Content-Type": "application/json" },
    })
  },
}))

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// Dynamic imports at module level (top-level await is valid in ESM)
const { GET: OverviewGET } = await import("./analytics/overview/route")
const { GET: UsersGET } = await import("./users/route")
const { GET: UserDetailGET } = await import("./user/[id]/route")
const { GET: ActivityGET } = await import("./analytics/activity/route")
const { GET: EngagementGET } = await import("./analytics/engagement/route")
const { GET: GradesGET } = await import("./analytics/grades/route")
const { GET: GradesStudentGET } = await import("./analytics/grades/student/route")
const { GET: PerformanceGET } = await import("./analytics/performance/route")
const { GET: ProgressGET } = await import("./analytics/progress/route")
const { GET: GroupsGET, POST: GroupsPOST, DELETE: GroupsDELETE } = await import("./groups/route")
const { GET: AssessmentsGET, POST: AssessmentsPOST } = await import("./assessments/route")
const { GET: CompareGET } = await import("./compare/route")
const { GET: AlertsGET, POST: AlertsPOST, PATCH: AlertsPATCH } = await import("./alerts/route")
const { POST: AlertsScanPOST } = await import("./alerts/scan/route")
const { GET: LiveGET } = await import("./live/route")
const { GET: ReportsGET } = await import("./reports/route")
const { GET: StudentPerformanceGET } = await import("./reports/student-performance/route")
const { GET: ClassPerformanceGET } = await import("./reports/class-performance/route")
const { requireAdminRole, isAuthError } = await import("@/lib/auth-helpers")

const mockAdminUser = { user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" } }
const mockModeratorUser = { user: { id: "mod-1", email: "mod@test.com", role: "MODERATOR" } }
const mockRegularUser = { user: { id: "user-1", email: "user@test.com", role: "USER" } }

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

// ==================== ADMIN OVERVIEW ====================

describe("api/admin/analytics/overview", () => {
  it("should return overview for admin user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(100)
    vi.mocked(db.userActivity.findMany).mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => ({ userId: `user-${i}` })) as never[]
    )
    vi.mocked(db.userActivity.count).mockResolvedValue(500)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([
      { action: "visualization_view", _count: 300 },
      { action: "quiz_complete", _count: 200 },
    ] as never[])
    vi.mocked(db.userSession.count).mockResolvedValue(150)
    vi.mocked(db.userSession.aggregate).mockResolvedValue({ _avg: { durationSec: 420 } } as never)

    const request = new NextRequest("http://localhost/api/admin/analytics/overview")
    const response = await OverviewGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.totalUsers).toBe(100)
    expect(data.data.activeUsers7d).toBe(25)
    expect(data.data.activeUsers30d).toBe(25)
    expect(data.data.totalActivities).toBe(500)
    expect(data.data.activitiesByType).toHaveLength(2)
    expect(data.data.totalSessions).toBe(150)
    expect(data.data.avgSessionDuration).toBe(420)
  })

  it("should return overview for moderator user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockModeratorUser)
    vi.mocked(db.user.count).mockResolvedValue(50)
    vi.mocked(db.userActivity.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.count).mockResolvedValue(0)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.count).mockResolvedValue(0)
    vi.mocked(db.userSession.aggregate).mockResolvedValue({ _avg: { durationSec: null } } as never)

    const request = new NextRequest("http://localhost/api/admin/analytics/overview")
    const response = await OverviewGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return 401 for unauthenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/admin/analytics/overview")
    const response = await OverviewGET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("should return 403 for non-admin user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockRegularUser)

    const request = new NextRequest("http://localhost/api/admin/analytics/overview")
    const response = await OverviewGET(request)

    expect(response.status).toBe(403)
  })

  it("should handle database errors", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockRejectedValue(new Error("DB connection failed"))

    const request = new NextRequest("http://localhost/api/admin/analytics/overview")
    const response = await OverviewGET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch overview")
  })

  it("should use custom date ranges from query params", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(100)
    vi.mocked(db.userActivity.findMany).mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ userId: `user-${i}` })) as never[]
    )
    vi.mocked(db.userActivity.count).mockResolvedValue(100)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.count).mockResolvedValue(0)
    vi.mocked(db.userSession.aggregate).mockResolvedValue({ _avg: { durationSec: null } } as never)

    const request = new NextRequest(
      "http://localhost/api/admin/analytics/overview?days7=1&days30=7"
    )
    const response = await OverviewGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return error for invalid query params", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)

    const request = new NextRequest("http://localhost/api/admin/analytics/overview?days7=-1")
    const response = await OverviewGET(request)
    const data = await response.json()

    expect([400, 500]).toContain(response.status)
    if (response.status === 400) {
      expect(data.error).toBe("Invalid query parameters")
    } else {
      expect(data.error).toBeTruthy()
    }
  })
})

// ==================== ADMIN USERS LIST ====================

describe("api/admin/users", () => {
  const mockUsers = [
    {
      id: "1",
      name: "Alice",
      email: "alice@test.com",
      role: "USER",
      createdAt: new Date(),
      image: null,
    },
    {
      id: "2",
      name: "Bob",
      email: "bob@test.com",
      role: "ADMIN",
      createdAt: new Date(),
      image: null,
    },
  ]

  const mockActivityCounts = [
    { userId: "1", _count: { id: 10 }, _sum: { xpGained: 500 }, _max: { createdAt: new Date() } },
    { userId: "2", _count: { id: 5 }, _sum: { xpGained: 200 }, _max: { createdAt: new Date() } },
  ]

  it("should return paginated users list", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue(mockUsers as never[])
    vi.mocked(db.user.count).mockResolvedValue(2)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue(mockActivityCounts as never[])

    const request = new NextRequest("http://localhost/api/admin/users")
    const response = await UsersGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.users).toHaveLength(2)
    expect(data.data.total).toBe(2)
    expect(data.data.page).toBe(1)
    expect(data.data.limit).toBe(20)
    expect(data.data.users[0].activityCount).toEqual({ id: 10 })
    expect(data.data.users[0].totalXp).toBe(500)
  })

  it("should support search parameter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue([mockUsers[0]] as never[])
    vi.mocked(db.user.count).mockResolvedValue(1)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([mockActivityCounts[0]] as never[])

    const request = new NextRequest("http://localhost/api/admin/users?search=alice")
    const response = await UsersGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.users).toHaveLength(1)
    expect(data.data.users[0].name).toBe("Alice")
  })

  it("should support role filter", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue([mockUsers[1]] as never[])
    vi.mocked(db.user.count).mockResolvedValue(1)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([mockActivityCounts[1]] as never[])

    const request = new NextRequest("http://localhost/api/admin/users?role=ADMIN")
    const response = await UsersGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.users[0].role).toBe("ADMIN")
  })

  it("should support pagination", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.user.count).mockResolvedValue(50)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])

    const request = new NextRequest("http://localhost/api/admin/users?page=2&limit=10")
    const response = await UsersGET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.page).toBe(2)
    expect(data.data.limit).toBe(10)
    expect(data.data.totalPages).toBe(5)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/admin/users")
    const response = await UsersGET(request)

    expect(response.status).toBe(401)
  })

  it("should handle database errors", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockRejectedValue(new Error("DB error"))

    const request = new NextRequest("http://localhost/api/admin/users")
    const response = await UsersGET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to fetch users")
  })
})

// ==================== ADMIN USER DETAIL ====================

describe("api/admin/user/[id]", () => {
  const mockUser = {
    id: "user-1",
    name: "Test User",
    email: "test@test.com",
    role: "USER",
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockActivities = [
    {
      id: "a1",
      userId: "user-1",
      action: "visualization_view",
      xpGained: 10,
      createdAt: new Date(),
    },
    { id: "a2", userId: "user-1", action: "quiz_complete", xpGained: 50, createdAt: new Date() },
  ]

  it("should return user detail with all related data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(db.userActivity.findMany).mockResolvedValue(mockActivities as never[])
    vi.mocked(db.userProgress.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.bookmark.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userAchievement.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.findMany).mockResolvedValue([] as never[])

    const request = new NextRequest("http://localhost/api/admin/user/user-1")
    const response = await UserDetailGET(request, { params: Promise.resolve({ id: "user-1" }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user.id).toBe("user-1")
    expect(data.data.totalXp).toBe(60)
    expect(data.data.totalActivities).toBe(2)
  })

  it("should return 404 for non-existent user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/admin/user/nonexistent")
    const response = await UserDetailGET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe("User not found")
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/admin/user/user-1")
    const response = await UserDetailGET(request, { params: Promise.resolve({ id: "user-1" }) })

    expect(response.status).toBe(401)
  })
})

// ==================== ANALYTICS ACTIVITY ====================

describe("api/admin/analytics/activity", () => {
  const mockActivities = [
    { action: "visualization_viewed", topic: "quantum", createdAt: new Date("2026-05-01") },
    { action: "quiz_passed", topic: "physics", createdAt: new Date("2026-05-02") },
  ]

  it("should return activity data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.findMany).mockResolvedValue(mockActivities as never[])
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([
      { topic: "quantum", _count: 5 },
    ] as never[])

    const response = await ActivityGET(
      new NextRequest("http://localhost/api/admin/analytics/activity")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.dailyData).toBeDefined()
    expect(data.data.topicBreakdown).toBeDefined()
  })

  it("should accept period and topic params", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])

    const response = await ActivityGET(
      new NextRequest("http://localhost/api/admin/analytics/activity?period=7d&topic=quantum")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await ActivityGET(
      new NextRequest("http://localhost/api/admin/analytics/activity")
    )
    expect(response.status).toBe(401)
  })

  it("should handle database errors", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.findMany).mockRejectedValue(new Error("DB error"))

    const response = await ActivityGET(
      new NextRequest("http://localhost/api/admin/analytics/activity")
    )
    expect(response.status).toBe(500)
  })
})

// ==================== ANALYTICS ENGAGEMENT ====================

describe("api/admin/analytics/engagement", () => {
  const mockActivities = [
    {
      userId: "u1",
      action: "visualization_viewed",
      topic: "quantum",
      createdAt: new Date("2026-05-01"),
    },
    { userId: "u2", action: "quiz_complete", topic: null, createdAt: new Date("2026-05-02") },
  ]

  it("should return engagement data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.findMany).mockResolvedValue(mockActivities as never[])
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([
      { userId: "u1", _count: { id: 5 } },
    ] as never[])

    const response = await EngagementGET(
      new NextRequest("http://localhost/api/admin/analytics/engagement")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.activeUsersOverTime).toBeDefined()
    expect(data.data.sessionDistribution).toBeDefined()
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await EngagementGET(
      new NextRequest("http://localhost/api/admin/analytics/engagement")
    )
    expect(response.status).toBe(401)
  })
})

// ==================== ANALYTICS GRADES ====================

describe("api/admin/analytics/grades", () => {
  const mockGrade = {
    id: "g1",
    score: 85,
    maxScore: 100,
    completedAt: new Date("2026-05-01"),
    assessmentId: "a1",
    userId: "u1",
    assessment: { title: "Test", topic: "quantum", maxScore: 100 },
  }

  it("should return grade analytics", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.grade.findMany).mockResolvedValue([mockGrade] as never[])
    vi.mocked(db.assessment.count).mockResolvedValue(5)

    const response = await GradesGET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.totalAssessments).toBe(5)
    expect(data.data.totalGrades).toBe(1)
    expect(data.data.avgScorePercentage).toBe(85)
  })

  it("should return empty data when no grades exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.grade.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.assessment.count).mockResolvedValue(0)

    const response = await GradesGET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.totalGrades).toBe(0)
    expect(data.data.avgScorePercentage).toBe(0)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await GradesGET()
    expect(response.status).toBe(401)
  })
})

// ==================== ANALYTICS GRADES STUDENT ====================

describe("api/admin/analytics/grades/student", () => {
  it("should return student grades", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "u1",
      name: "Test",
      email: "test@test.com",
    } as never)
    vi.mocked(db.grade.findMany).mockResolvedValue([
      {
        score: 80,
        maxScore: 100,
        completedAt: new Date("2026-05-01"),
        assessmentId: "a1",
        userId: "u1",
        assessment: { title: "Quiz 1", topic: "quantum", maxScore: 100 },
      },
    ] as never[])

    const response = await GradesStudentGET(
      new NextRequest("http://localhost/api/admin/analytics/grades/student?userId=u1")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.overall.totalTaken).toBe(1)
  })

  it("should return 400 without userId", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const response = await GradesStudentGET(
      new NextRequest("http://localhost/api/admin/analytics/grades/student")
    )
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe("userId is required")
  })

  it("should return 404 for unknown user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const response = await GradesStudentGET(
      new NextRequest("http://localhost/api/admin/analytics/grades/student?userId=unknown")
    )
    expect(response.status).toBe(404)
  })
})

// ==================== ANALYTICS PERFORMANCE ====================

describe("api/admin/analytics/performance", () => {
  it("should return performance rankings", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([
      {
        userId: "u1",
        _sum: { xpGained: 500 },
        _count: { id: 10 },
        _max: { createdAt: new Date() },
      },
    ] as never[])
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "u1", name: "Alice", email: "alice@test.com", createdAt: new Date("2026-01-01") },
    ] as never[])

    const response = await PerformanceGET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.rankings).toHaveLength(1)
    expect(data.data.xpDistribution).toBeDefined()
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await PerformanceGET()
    expect(response.status).toBe(401)
  })
})

// ==================== ANALYTICS PROGRESS ====================

describe("api/admin/analytics/progress", () => {
  it("should return topic progress stats", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(100)
    vi.mocked(db.userProgress.groupBy).mockResolvedValue([
      {
        topic: "quantum",
        _count: { userId: 30 },
        _sum: { completedCount: 150 },
        _max: { lastCompleted: new Date() },
      },
    ] as never[])
    vi.mocked(db.bookmark.groupBy).mockResolvedValue([
      { topic: "quantum", _count: { id: 5 } },
    ] as never[])

    const response = await ProgressGET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.topicStats).toHaveLength(1)
    expect(data.data.topicStats[0].completionRate).toBe(30)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await ProgressGET()
    expect(response.status).toBe(401)
  })
})

// ==================== LIVE ====================

describe("api/admin/live", () => {
  it("should return live activity data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.userActivity.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.count).mockResolvedValue(0)
    vi.mocked(db.user.findMany).mockResolvedValue([] as never[])

    const response = await LiveGET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.currentlyActive).toBe(0)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await LiveGET()
    expect(response.status).toBe(401)
  })
})

// ==================== REPORTS ====================

describe("api/admin/reports", () => {
  it("should return report data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(10)
    vi.mocked(db.userActivity.count).mockResolvedValue(100)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([
      { action: "view", _count: 60 },
    ] as never[])
    vi.mocked(db.userProgress.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.findMany).mockResolvedValue([] as never[])

    const response = await ReportsGET(new NextRequest("http://localhost/api/admin/reports"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.period).toBeDefined()
    expect(data.data.summary).toBeDefined()
  })

  it("should accept custom range", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(0)
    vi.mocked(db.userActivity.count).mockResolvedValue(0)
    vi.mocked(db.userActivity.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userProgress.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.findMany).mockResolvedValue([] as never[])

    const response = await ReportsGET(
      new NextRequest("http://localhost/api/admin/reports?range=7d")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.period.days).toBe(7)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await ReportsGET(new NextRequest("http://localhost/api/admin/reports"))
    expect(response.status).toBe(401)
  })
})

// ==================== COMPARE ====================

describe("api/admin/compare", () => {
  it("should compare students", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "u1",
        name: "Alice",
        email: "alice@test.com",
        role: "USER",
        createdAt: new Date(),
        image: null,
      },
      {
        id: "u2",
        name: "Bob",
        email: "bob@test.com",
        role: "USER",
        createdAt: new Date(),
        image: null,
      },
    ] as never[])
    vi.mocked(db.userActivity.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userProgress.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userAchievement.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userSession.findMany).mockResolvedValue([] as never[])

    const response = await CompareGET(
      new NextRequest("http://localhost/api/admin/compare?ids=u1,u2")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
  })

  it("should return 400 with less than 2 IDs", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const response = await CompareGET(new NextRequest("http://localhost/api/admin/compare?ids=u1"))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe("Compare requires 2-5 student IDs")
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await CompareGET(
      new NextRequest("http://localhost/api/admin/compare?ids=u1,u2")
    )
    expect(response.status).toBe(401)
  })
})

// ==================== GROUPS ====================

describe("api/admin/groups", () => {
  it("GET should return all groups", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.studentGroup.findMany).mockResolvedValue([
      {
        id: "g1",
        name: "Group A",
        description: null,
        createdAt: new Date(),
        createdBy: "admin-1",
        _count: { members: 5 },
      },
    ] as never[])

    const response = await GroupsGET(new NextRequest("http://localhost/api/admin/groups"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("GET should return single group by id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.studentGroup.findUnique).mockResolvedValue({
      id: "g1",
      name: "Group A",
      description: null,
      createdAt: new Date(),
      createdBy: "admin-1",
      members: [{ groupId: "g1", userId: "u1", joinedAt: new Date() }],
    } as never)
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "u1", name: "Alice", email: "alice@test.com" },
    ] as never[])

    const response = await GroupsGET(new NextRequest("http://localhost/api/admin/groups?id=g1"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should create a group", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.studentGroup.create).mockResolvedValue({
      id: "g-new",
      name: "New Group",
      description: null,
      createdBy: "admin-1",
      members: [],
    } as never)
    vi.mocked(db.user.findMany).mockResolvedValue([] as never[])

    const request = new NextRequest("http://localhost/api/admin/groups", {
      method: "POST",
      body: JSON.stringify({ name: "New Group" }),
    })
    const response = await GroupsPOST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should reject invalid group data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const request = new NextRequest("http://localhost/api/admin/groups", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    })
    const response = await GroupsPOST(request)
    expect(response.status).toBe(400)
  })

  it("DELETE should delete group by id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)

    const response = await GroupsDELETE(new NextRequest("http://localhost/api/admin/groups?id=g1"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("DELETE should return 400 without id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const response = await GroupsDELETE(new NextRequest("http://localhost/api/admin/groups"))
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe("Missing id parameter")
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await GroupsGET(new NextRequest("http://localhost/api/admin/groups"))
    expect(response.status).toBe(401)
  })
})

// ==================== ASSESSMENTS ====================

describe("api/admin/assessments", () => {
  it("GET should return all assessments", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.assessment.findMany).mockResolvedValue([
      {
        id: "a1",
        title: "Quiz 1",
        topic: "quantum",
        maxScore: 100,
        description: null,
        createdAt: new Date(),
        createdBy: "admin-1",
        _count: { grades: 10 },
      },
    ] as never[])

    const response = await AssessmentsGET(new NextRequest("http://localhost/api/admin/assessments"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("GET should return assessment with grades by id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.grade.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.user.findMany).mockResolvedValue([] as never[])

    const response = await AssessmentsGET(
      new NextRequest("http://localhost/api/admin/assessments?assessmentId=a1")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should create an assessment", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.assessment.create).mockResolvedValue({
      id: "a-new",
      title: "New Quiz",
      description: null,
      topic: "quantum",
      maxScore: 100,
      createdBy: "admin-1",
    } as never)

    const request = new NextRequest("http://localhost/api/admin/assessments", {
      method: "POST",
      body: JSON.stringify({ title: "New Quiz", topic: "quantum", maxScore: 100 }),
    })
    const response = await AssessmentsPOST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should reject invalid assessment data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const request = new NextRequest("http://localhost/api/admin/assessments", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
    })
    const response = await AssessmentsPOST(request)
    expect(response.status).toBe(400)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await AssessmentsGET(new NextRequest("http://localhost/api/admin/assessments"))
    expect(response.status).toBe(401)
  })
})

// ==================== ALERTS ====================

describe("api/admin/alerts", () => {
  it("GET should return alerts", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.adminAlert.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.adminAlert.count).mockResolvedValue(0)

    const response = await AlertsGET(new NextRequest("http://localhost/api/admin/alerts"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.alerts).toBeDefined()
    expect(data.data.unreadCount).toBe(0)
  })

  it("GET should filter unread alerts", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.adminAlert.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.adminAlert.count).mockResolvedValue(0)

    const response = await AlertsGET(
      new NextRequest("http://localhost/api/admin/alerts?unread=true")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should create an alert", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.adminAlert.create).mockResolvedValue({} as never)

    const request = new NextRequest("http://localhost/api/admin/alerts", {
      method: "POST",
      body: JSON.stringify({ type: "info", message: "Test alert", severity: "warning" }),
    })
    const response = await AlertsPOST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("POST should reject invalid alert data", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const request = new NextRequest("http://localhost/api/admin/alerts", {
      method: "POST",
      body: JSON.stringify({ type: "", message: "" }),
    })
    const response = await AlertsPOST(request)
    expect(response.status).toBe(400)
  })

  it("PATCH should mark single alert as read", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)

    const response = await AlertsPATCH(
      new NextRequest("http://localhost/api/admin/alerts?id=alert-1")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("PATCH should mark all as read without id", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)

    const response = await AlertsPATCH(new NextRequest("http://localhost/api/admin/alerts"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await AlertsGET(new NextRequest("http://localhost/api/admin/alerts"))
    expect(response.status).toBe(401)
  })
})

// ==================== ALERTS SCAN ====================

describe("api/admin/alerts/scan", () => {
  it("POST should scan for at-risk students", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "u1", name: "Alice", email: "alice@test.com", createdAt: new Date("2025-01-01") },
    ] as never[])
    vi.mocked(db.userActivity.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.userProgress.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.adminAlert.findMany).mockResolvedValue([] as never[])
    vi.mocked(db.adminAlert.createMany).mockResolvedValue({ count: 2 })

    const response = await AlertsScanPOST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.scanned).toBeGreaterThan(0)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await AlertsScanPOST()
    expect(response.status).toBe(401)
  })
})

// ==================== AUTH HELPERS ====================

describe("auth-helpers (admin)", () => {
  it("should return error for null session", async () => {
    const result = await requireAdminRole(null)
    expect(isAuthError(result)).toBe(true)
    if (isAuthError(result)) {
      expect(result.error).toBe("Unauthorized")
      expect(result.status).toBe(401)
    }
  })

  it("should return error for session without user id", async () => {
    const result = await requireAdminRole({ user: {} } as never)
    expect(isAuthError(result)).toBe(true)
    if (isAuthError(result)) {
      expect(result.error).toBe("Unauthorized")
    }
  })

  it("should return error for regular USER role", async () => {
    const result = await requireAdminRole({ user: { id: "u1", role: "USER" } } as never)
    expect(isAuthError(result)).toBe(true)
    if (isAuthError(result)) {
      expect(result.error).toBe("Forbidden")
      expect(result.status).toBe(403)
    }
  })

  it("should allow ADMIN role", async () => {
    const result = await requireAdminRole({ user: { id: "admin-1", role: "ADMIN" } } as never)
    expect(isAuthError(result)).toBe(false)
  })

  it("should allow MODERATOR role", async () => {
    const result = await requireAdminRole({ user: { id: "mod-1", role: "MODERATOR" } } as never)
    expect(isAuthError(result)).toBe(false)
  })
})

// ==================== STUDENT PERFORMANCE REPORT ====================

describe("api/admin/reports/student-performance", () => {
  const mockStudent = { id: "student-1", name: "Test Student", email: "test@test.com", createdAt: new Date("2026-01-01") }
  const mockAssessment = { title: "Test Assessment", topic: "quantum", maxScore: 100 }
  const mockGrades = [
    { id: "g1", assessmentId: "a1", userId: "student-1", score: 85, maxScore: 100, completedAt: new Date("2026-03-01"), assessment: mockAssessment },
    { id: "g2", assessmentId: "a2", userId: "student-1", score: 70, maxScore: 100, completedAt: new Date("2026-04-01"), assessment: { ...mockAssessment, title: "Assessment 2" } },
  ]

  it("should return student performance report", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(mockStudent)
    vi.mocked(db.grade.findMany).mockResolvedValue(mockGrades)
    vi.mocked(db.grade.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.aggregate).mockResolvedValue({ _sum: { xpGained: 500 }, _count: 20 } as never)

    const response = await StudentPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/student-performance?userId=student-1")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.student.id).toBe("student-1")
    expect(data.data.overall.avgScore).toBe(78)
    expect(data.data.overall.totalXp).toBe(500)
    expect(data.data.byTopic).toHaveLength(1)
    expect(data.data.overall.overallMastery).toBe("proficient")
    expect(data.data.trendDirection).toBe("declining")
  })

  it("should return 400 without userId", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    const response = await StudentPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/student-performance")
    )
    expect(response.status).toBe(400)
  })

  it("should return 404 for unknown user", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const response = await StudentPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/student-performance?userId=nonexistent")
    )
    expect(response.status).toBe(404)
  })

  it("should handle empty grades", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.findUnique).mockResolvedValue(mockStudent)
    vi.mocked(db.grade.findMany).mockResolvedValue([])
    vi.mocked(db.grade.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.userActivity.aggregate).mockResolvedValue({ _sum: { xpGained: 0 }, _count: 0 } as never)

    const response = await StudentPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/student-performance?userId=student-1")
    )
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.data.overall.totalTaken).toBe(0)
    expect(data.data.weakestTopic).toBeNull()
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await StudentPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/student-performance?userId=student-1")
    )
    expect(response.status).toBe(401)
  })
})

// ==================== CLASS PERFORMANCE REPORT ====================

describe("api/admin/reports/class-performance", () => {
  it("should return class performance report", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(30)
    vi.mocked(db.grade.groupBy).mockResolvedValue([{ userId: "u1" }] as never[])
    vi.mocked(db.grade.findMany).mockResolvedValue([
      { id: "g1", assessmentId: "a1", userId: "u1", score: 85, maxScore: 100, completedAt: new Date(), assessment: { title: "Test", topic: "quantum", maxScore: 100 } },
      { id: "g2", assessmentId: "a2", userId: "u2", score: 45, maxScore: 100, completedAt: new Date(), assessment: { title: "Test 2", topic: "quantum", maxScore: 100 } },
    ] as never[])
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "u1", name: "Alice", email: "alice@test.com" },
      { id: "u2", name: "Bob", email: "bob@test.com" },
    ] as never[])

    const response = await ClassPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/class-performance")
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.totalStudents).toBe(30)
    expect(data.data.gradedStudentCount).toBe(1)
    expect(data.data.overall.avgScore).toBe(65)
    expect(data.data.overall.passRate).toBe(50)
    expect(data.data.topStudents).toHaveLength(2)
    expect(data.data.mostDifficultAssessments).toHaveLength(2)
  })

  it("should handle empty grades", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockAdminUser)
    vi.mocked(db.user.count).mockResolvedValue(30)
    vi.mocked(db.grade.groupBy).mockResolvedValue([] as never[])
    vi.mocked(db.grade.findMany).mockResolvedValue([] as never[])

    const response = await ClassPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/class-performance")
    )
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.data.overall.totalGrades).toBe(0)
    expect(data.data.topStudents).toHaveLength(0)
  })

  it("should return 401 for unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const response = await ClassPerformanceGET(
      new NextRequest("http://localhost/api/admin/reports/class-performance")
    )
    expect(response.status).toBe(401)
  })
})
