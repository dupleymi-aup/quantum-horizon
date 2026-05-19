"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

export type MasteryLevel = "beginner" | "developing" | "proficient" | "advanced"
export type TrendDirection = "improving" | "declining" | "stable"

export interface StudentReportTopic {
  topic: string
  firstScore: number
  latestScore: number
  improvement: number
  avgScore: number
  assessmentsTaken: number
  mastery: MasteryLevel
  classAvg: number
  vsClassAvg: number
}

export interface StudentReportTimeline {
  date: string
  score: number
  topic: string
  assessment: string
}

export interface StudentPerformanceReport {
  student: {
    id: string
    name: string | null
    email: string | null
    registeredAt: string
  }
  overall: {
    avgScore: number
    bestScore: number
    worstScore: number
    totalTaken: number
    totalXp: number
    activityCount: number
    overallMastery: MasteryLevel
  }
  timeline: StudentReportTimeline[]
  byTopic: StudentReportTopic[]
  classPercentile: number | null
  weakestTopic: { topic: string; avgScore: number; mastery: MasteryLevel } | null
  strongestTopic: { topic: string; avgScore: number; mastery: MasteryLevel } | null
  trendDirection: TrendDirection
}

export interface ClassByTopic {
  topic: string
  avgScore: number
  totalAttempts: number
  passRate: number
}

export interface ClassStudentSummary {
  userId: string
  name: string
  avgScore: number
  assessmentsTaken: number
}

export interface ClassAssessmentDifficulty {
  title: string
  topic: string
  avgScore: number
  attempts: number
}

export interface ClassTrendPoint {
  date: string
  avgScore: number
  totalGrades: number
}

export interface ClassPerformanceReport {
  totalStudents: number
  gradedStudentCount: number
  overall: {
    avgScore: number
    minScore: number
    maxScore: number
    totalGrades: number
    passRate: number
  }
  gradeDistribution: Array<{ range: string; count: number }>
  byTopic: ClassByTopic[]
  topStudents: ClassStudentSummary[]
  bottomStudents: ClassStudentSummary[]
  mostDifficultAssessments: ClassAssessmentDifficulty[]
  trendsOverTime: ClassTrendPoint[]
}

function parseQueryResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${String(response.status)}`)
  }
  return response.json().then((result: { data: T }) => result.data)
}

export function useStudentPerformanceReport(userId: string) {
  return useQuery<StudentPerformanceReport>({
    queryKey: ["adminReports", "student-performance", userId],
    queryFn: async () => {
      const res = await fetchWithTimeout(`/api/admin/reports/student-performance?userId=${userId}`, {
        timeoutMs: 15000,
      })
      return parseQueryResponse<StudentPerformanceReport>(res)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useClassPerformanceReport() {
  return useQuery<ClassPerformanceReport>({
    queryKey: ["adminReports", "class-performance"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/class-performance", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<ClassPerformanceReport>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}
