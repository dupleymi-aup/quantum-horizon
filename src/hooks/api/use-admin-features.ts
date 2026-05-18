"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

export interface ComparisonStudent {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    createdAt: string | null
    image: string | null
  }
  totalXp: number
  totalActivities: number
  totalAchievements: number
  totalSessionTime: number
  topicsCompleted: number
  topicCompletion: { topic: string; count: number }[]
  activityByType: { action: string; count: number }[]
  lastActive: number | null
}

export interface AdminAlert {
  id: string
  userId: string | null
  type: string
  message: string
  severity: string
  read: boolean
  createdAt: string
}

export interface LiveData {
  currentlyActive: number
  recentActivities: {
    id: string
    action: string
    topic: string | null
    userName: string | null
    createdAt: string
  }[]
  todayStats: {
    uniqueUsers: number
    byType: { action: string; count: number }[]
  }
  fiveMinCount: number
}

export interface ReportData {
  period: { start: string; end: string; days: number }
  summary: {
    newUsers: number
    totalActivities: number
    achievementUnlocks: number
    avgSessionDuration: number
    activityTrend: number
  }
  activityBreakdown: { action: string; count: number }[]
  topTopics: { topic: string; users: number; completions: number }[]
}

// Comparison
export function useStudentComparison(userIds: string[]) {
  return useQuery<ComparisonStudent[]>({
    queryKey: ["adminCompare", userIds],
    queryFn: async () => {
      if (userIds.length < 2) return []
      const res = await fetchWithTimeout(
        `/api/admin/compare?ids=${userIds.join(",")}`,
        { timeoutMs: 15000 }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.data
    },
    enabled: userIds.length >= 2,
    staleTime: 2 * 60 * 1000,
  })
}

// Alerts
export function useAdminAlerts(unreadOnly = false) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ alerts: AdminAlert[]; unreadCount: number }>({
    queryKey: ["adminAlerts", unreadOnly],
    queryFn: async () => {
      const res = await fetchWithTimeout(
        `/api/admin/alerts?unread=${unreadOnly}`,
        { timeoutMs: 10000 }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.data
    },
    refetchInterval: unreadOnly ? 30000 : false,
    staleTime: 1 * 60 * 1000,
  })

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      const url = id
        ? `/api/admin/alerts?id=${id}`
        : "/api/admin/alerts"
      const res = await fetchWithTimeout(url, {
        method: "PATCH",
        timeoutMs: 10000,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminAlerts"] })
    },
  })

  return { data, isLoading, error, markRead: markRead.mutateAsync }
}

// Live data
export function useAdminLiveData(refreshInterval = 15000) {
  return useQuery<LiveData>({
    queryKey: ["adminLive"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/live", { timeoutMs: 10000 })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.data
    },
    refetchInterval: refreshInterval,
    staleTime: 10000,
  })
}

// Reports
export function useAdminReport(range = "30d") {
  return useQuery<ReportData>({
    queryKey: ["adminReport", range],
    queryFn: async () => {
      const res = await fetchWithTimeout(`/api/admin/reports?range=${range}`, {
        timeoutMs: 15000,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
