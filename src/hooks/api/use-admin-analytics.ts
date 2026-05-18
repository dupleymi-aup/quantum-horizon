"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

export interface OverviewData {
  totalUsers: number
  activeUsers7d: number
  activeUsers30d: number
  totalActivities: number
  activitiesByType: { action: string; count: number }[]
  totalSessions: number
  avgSessionDuration: number
}

export interface ActivityDailyData {
  date: string
  visualizationViews: number
  lessonsCompleted: number
  quizzesPassed: number
  quizzesFailed: number
  achievementUnlocks: number
  presetsCreated: number
  comparisonsPerformed: number
}

export interface TopicBreakdown {
  topic: string
  count: number
}

export interface ActivityData {
  dailyData: ActivityDailyData[]
  topicBreakdown: TopicBreakdown[]
}

export interface TopicStat {
  topic: string
  completionRate: number
  avgProgress: number
  totalUsers: number
  bookmarkCount: number
  lastActivity: string | null
}

export interface ProgressData {
  totalUsers: number
  topicStats: TopicStat[]
}

export interface ActiveUserPoint {
  date: string
  count: number
}

export interface PopularVisualization {
  topic: string
  count: number
}

export interface SessionRange {
  range: string
  count: number
}

export interface EngagementData {
  activeUsersOverTime: ActiveUserPoint[]
  popularVisualizations: PopularVisualization[]
  sessionDistribution: SessionRange[]
}

export interface RankingEntry {
  userId: string
  name: string
  email: string
  totalXp: number
  activityCount: number
  lastActive: string | null
  registeredAt: string | null
}

export interface XpBucket {
  range: string
  count: number
}

export interface CohortData {
  cohort: string
  avgXp: number
  avgActivities: number
  users: number
}

export interface PerformanceData {
  rankings: RankingEntry[]
  xpDistribution: XpBucket[]
  cohortComparison: CohortData[]
}

export interface AdminUser {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
  image: string | null
  activityCount: number
  totalXp: number
  lastActive: string | null
}

export interface UsersListData {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function parseQueryResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json().then((result) => result.data as T)
}

export function useAdminOverview() {
  return useQuery<OverviewData>({
    queryKey: ["adminAnalytics", "overview"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/analytics/overview", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<OverviewData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminActivityAnalytics(period = "30d") {
  return useQuery<ActivityData>({
    queryKey: ["adminAnalytics", "activity", period],
    queryFn: async () => {
      const res = await fetchWithTimeout(
        `/api/admin/analytics/activity?period=${period}`,
        { timeoutMs: 15000 }
      )
      return parseQueryResponse<ActivityData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminProgressAnalytics() {
  return useQuery<ProgressData>({
    queryKey: ["adminAnalytics", "progress"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/analytics/progress", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<ProgressData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminEngagementAnalytics(days = 30) {
  return useQuery<EngagementData>({
    queryKey: ["adminAnalytics", "engagement", days],
    queryFn: async () => {
      const res = await fetchWithTimeout(
        `/api/admin/analytics/engagement?days=${days}`,
        { timeoutMs: 15000 }
      )
      return parseQueryResponse<EngagementData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminPerformanceAnalytics() {
  return useQuery<PerformanceData>({
    queryKey: ["adminAnalytics", "performance"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/analytics/performance", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<PerformanceData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminUsersList(page = 1, search = "", role = "") {
  return useQuery<UsersListData>({
    queryKey: ["adminUsers", page, search, role],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
      })
      const res = await fetchWithTimeout(`/api/admin/users?${params.toString()}`, {
        timeoutMs: 15000,
      })
      return parseQueryResponse<UsersListData>(res)
    },
    staleTime: 2 * 60 * 1000,
  })
}

export interface GradeTrendPoint {
  date: string
  avgScore: number
}

export interface GradeDistributionBucket {
  range: string
  count: number
}

export interface GradeByTopic {
  topic: string
  avgScore: number
  count: number
}

export interface AssessmentDifficulty {
  title: string
  topic: string
  avgScore: number
  count: number
  stdDev: number
}

export interface GradesOverviewData {
  totalAssessments: number
  totalGrades: number
  avgScorePercentage: number
  passRate: number
  trendsOverTime: GradeTrendPoint[]
  gradeDistribution: GradeDistributionBucket[]
  avgByTopic: GradeByTopic[]
  assessmentDifficulty: AssessmentDifficulty[]
}

export interface StudentGradeTimeline {
  date: string
  score: number
  topic: string
  assessment: string
}

export interface StudentGradeByTopic {
  topic: string
  firstScore: number
  latestScore: number
  improvement: number
  avgScore: number
  assessmentsTaken: number
}

export interface StudentGradeData {
  student: { id: string; name: string | null; email: string | null }
  overall: { avgScore: number; bestScore: number; worstScore: number; totalTaken: number }
  timeline: StudentGradeTimeline[]
  byTopic: StudentGradeByTopic[]
}

export function useAdminGradesOverview() {
  return useQuery<GradesOverviewData>({
    queryKey: ["adminAnalytics", "grades"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/analytics/grades", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<GradesOverviewData>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentGradeAnalytics(userId: string) {
  return useQuery<StudentGradeData>({
    queryKey: ["adminAnalytics", "grades", "student", userId],
    queryFn: async () => {
      const res = await fetchWithTimeout(
        `/api/admin/analytics/grades/student?userId=${userId}`,
        { timeoutMs: 15000 }
      )
      return parseQueryResponse<StudentGradeData>(res)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}
