"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

interface DashboardStats {
  level: number
  totalXP: number
  xpToNextLevel: number
  completedTopics: number
  totalStudyMinutes: number
  totalSessions: number
  weeklySessions: number
  achievementsUnlocked: number
  achievementsInProgress: number
  assessmentsTaken: number
  overallGradeAvg: number | null
}

interface TopicProgress {
  id: string
  topic: string
  completedCount: number
  lastCompleted: string
}

interface Achievement {
  id: string
  achievementId: string
  progress: number
  target: number
  unlocked: boolean
  unlockedAt: string
}

interface ActivityItem {
  id: string
  action: string
  topic: string | null
  xpGained: number
  createdAt: string
}

interface XPTrendPoint {
  date: string
  xp: number
}

interface TopicGrade {
  topic: string
  avgScore: number
  assessmentsTaken: number
}

interface DashboardData {
  stats: DashboardStats
  progress: TopicProgress[]
  achievements: Achievement[]
  recentActivity: ActivityItem[]
  xpTrend: XPTrendPoint[]
  topicGrades: TopicGrade[]
}

interface DashboardResponse {
  success: boolean
  data?: DashboardData
  error?: string
}

const DASHBOARD_QUERY_KEY = ["userDashboard"] as const

export function useUserDashboard() {
  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWithTimeout("/api/user/dashboard", {
        timeoutMs: 10000,
      })

      if (!response.ok) {
        if (response.status === 401) {
          return null
        }
        throw new Error(`HTTP error! status: ${String(response.status)}`)
      }

      const result = (await response.json()) as DashboardResponse
      return result.success && result.data ? result.data : null
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  })

  const error = queryError instanceof Error ? queryError.message : null

  return {
    dashboard: data,
    loading,
    error,
    refetch,
  }
}
