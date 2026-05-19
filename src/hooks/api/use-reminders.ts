"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

interface Reminder {
  id: string
  userId: string
  type: "PERSONAL" | "STUDY" | "EXAM"
  title: string
  description: string | null
  topic: string | null
  deadline: string
  reminded: boolean
  reminderSentAt: string | null
  createdAt: string
  updatedAt: string
}

interface ExamDeadline {
  id: string
  title: string
  description: string | null
  topic: string
  examDate: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface CheckResponse {
  dueReminders: Reminder[]
  upcomingExams: ExamDeadline[]
  unreadCount: number
}

const REMINDERS_QUERY_KEY = ["reminders"] as const
const CHECK_QUERY_KEY = ["reminders", "check"] as const
const EXAM_DEADLINES_QUERY_KEY = ["admin", "exam-deadlines"] as const

/**
 * Хук для получения списка напоминаний пользователя
 */
export function useReminders(type?: "PERSONAL" | "STUDY" | "EXAM") {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [...REMINDERS_QUERY_KEY, type],
    queryFn: async () => {
      const url = new URL("/api/reminders", window.location.origin)
      if (type) url.searchParams.set("type", type)
      const response = await fetchWithTimeout(url.toString(), { timeoutMs: 10000 })
      if (!response.ok) return { reminders: [] as Reminder[] }
      const result = (await response.json()) as { success: boolean; data: Reminder[] }
      return { reminders: result.data ?? [] }
    },
    staleTime: 60_000,
  })

  const createReminder = useMutation({
    mutationFn: async (body: {
      title: string
      description?: string
      topic?: string
      deadline: string
      type?: "PERSONAL" | "STUDY" | "EXAM"
    }) => {
      const response = await fetchWithTimeout("/api/reminders", {
        timeoutMs: 10000,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(`Failed to create reminder: ${response.status}`)
      return (await response.json()) as { success: boolean; data: Reminder }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  const updateReminder = useMutation({
    mutationFn: async ({ id, reminded }: { id: string; reminded: boolean }) => {
      const response = await fetchWithTimeout(`/api/reminders?id=${id}`, {
        timeoutMs: 10000,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminded }),
      })
      if (!response.ok) throw new Error(`Failed to update reminder: ${response.status}`)
      return (await response.json()) as { success: boolean; data: Reminder }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithTimeout(`/api/reminders?id=${id}`, {
        timeoutMs: 10000,
        method: "DELETE",
      })
      if (!response.ok) throw new Error(`Failed to delete reminder: ${response.status}`)
      return (await response.json()) as { success: boolean }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  return {
    reminders: data?.reminders ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    createReminder: createReminder.mutateAsync,
    updateReminder: updateReminder.mutateAsync,
    deleteReminder: deleteReminder.mutateAsync,
    isCreating: createReminder.isPending,
    isUpdating: updateReminder.isPending,
    isDeleting: deleteReminder.isPending,
  }
}

/**
 * Хук для проверки напоминаний, срок которых истёк
 */
export function useCheckReminders() {
  return useQuery({
    queryKey: CHECK_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWithTimeout("/api/reminders/check", { timeoutMs: 10000 })
      if (!response.ok) return { dueReminders: [] as Reminder[], upcomingExams: [] as ExamDeadline[], unreadCount: 0 }
      const result = (await response.json()) as { success: boolean; data: CheckResponse }
      return result.data ?? { dueReminders: [], upcomingExams: [], unreadCount: 0 }
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

/**
 * Хук для отклонения/переноса напоминания об экзамене
 */
export function useDismissReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      examDeadlineId,
      snoozeUntil,
    }: {
      examDeadlineId: string
      snoozeUntil?: string
    }) => {
      const response = await fetchWithTimeout("/api/reminders/check/dismiss", {
        timeoutMs: 10000,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDeadlineId, snoozeUntil }),
      })
      if (!response.ok) throw new Error(`Failed to dismiss reminder: ${response.status}`)
      return (await response.json()) as { success: boolean }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })
}

/**
 * Хук для управления экзаменационными дедлайнами (admin)
 */
export function useExamDeadlines() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: EXAM_DEADLINES_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchWithTimeout("/api/admin/exam-deadlines", { timeoutMs: 10000 })
      if (!response.ok) return { exams: [] as ExamDeadline[] }
      const result = (await response.json()) as { success: boolean; data: ExamDeadline[] }
      return { exams: result.data ?? [] }
    },
    staleTime: 60_000,
  })

  const createExam = useMutation({
    mutationFn: async (body: {
      title: string
      description?: string
      topic: string
      examDate: string
      isActive?: boolean
    }) => {
      const response = await fetchWithTimeout("/api/admin/exam-deadlines", {
        timeoutMs: 10000,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(`Failed to create exam: ${response.status}`)
      return (await response.json()) as { success: boolean; data: ExamDeadline }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_DEADLINES_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithTimeout(`/api/admin/exam-deadlines?id=${id}`, {
        timeoutMs: 10000,
        method: "DELETE",
      })
      if (!response.ok) throw new Error(`Failed to delete exam: ${response.status}`)
      return (await response.json()) as { success: boolean }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_DEADLINES_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  const updateExam = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { isActive?: boolean } }) => {
      const response = await fetchWithTimeout(`/api/admin/exam-deadlines?id=${id}`, {
        timeoutMs: 10000,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`Failed to update exam: ${response.status}`)
      return (await response.json()) as { success: boolean; data: ExamDeadline }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_DEADLINES_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: CHECK_QUERY_KEY })
    },
  })

  return {
    exams: data?.exams ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    createExam: createExam.mutateAsync,
    updateExam: updateExam.mutateAsync,
    deleteExam: deleteExam.mutateAsync,
    isCreating: createExam.isPending,
    isUpdating: updateExam.isPending,
    isDeleting: deleteExam.isPending,
  }
}
