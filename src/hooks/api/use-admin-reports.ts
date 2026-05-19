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

// At-Risk Report Types & Hook
export interface AtRiskStudent {
  userId: string
  name: string | null
  email: string | null
  avgScore: number
  trendDirection: TrendDirection
  masteryLevel: MasteryLevel
  daysSinceLastActivity: number
  riskFactors: string[]
  riskScore: number
  lastGradeDate: string | null
  totalAssessments: number
  weakestTopic: string | null
}

export interface AtRiskReport {
  atRiskStudents: AtRiskStudent[]
  summary: {
    totalAtRisk: number
    criticalCount: number
    warningCount: number
    infoCount: number
    mostCommonRiskFactor: string
  }
}

export function useAtRiskReport() {
  return useQuery<AtRiskReport>({
    queryKey: ["adminReports", "at-risk"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/at-risk", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<AtRiskReport>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Topic Mastery Report Types & Hook
export interface TopicMasteryData {
  topic: string
  masteryDistribution: Record<MasteryLevel, number>
  avgScore: number
  totalStudents: number
  passRate: number
  trend: Array<{ date: string; avgScore: number }>
  weakestAssessments: Array<{ title: string; avgScore: number }>
}

export interface TopicMasteryReport {
  topics: TopicMasteryData[]
  overallMasteryDistribution: Record<MasteryLevel, number>
}

export function useTopicMasteryReport() {
  return useQuery<TopicMasteryReport>({
    queryKey: ["adminReports", "topic-mastery"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/topic-mastery", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<TopicMasteryReport>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Group Comparison Report Types & Hook
export interface GroupByTopic {
  topic: string
  avgScore: number
  passRate: number
}

export interface GroupTrendPoint {
  date: string
  avgScore: number
}

export interface GroupComparisonData {
  id: string
  name: string
  description: string | null
  memberCount: number
  avgScore: number
  passRate: number
  totalGrades: number
  activeStudents: number
  byTopic: GroupByTopic[]
  trendsOverTime: GroupTrendPoint[]
}

export interface GroupComparisonReport {
  groups: GroupComparisonData[]
}

export function useGroupComparisonReport() {
  return useQuery<GroupComparisonReport>({
    queryKey: ["adminReports", "group-comparison"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/group-comparison", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<GroupComparisonReport>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Engagement-Grade Correlation Report Types & Hook
export interface EngagementGradePoint {
  userId: string
  name: string | null
  activityCount: number
  totalSessionMinutes: number
  totalXp: number
  avgGrade: number
  assessmentCount: number
}

export interface QuadrantStudent {
  userId: string
  name: string | null
  avgGrade: number
  activityCount: number
}

export interface CorrelationStats {
  activityGradeCorrelation: number
  sessionGradeCorrelation: number
}

export interface EngagementGradeCorrelation {
  scatterData: EngagementGradePoint[]
  quadrants: {
    highEngagementHighGrade: QuadrantStudent[]
    highEngagementLowGrade: QuadrantStudent[]
    lowEngagementHighGrade: QuadrantStudent[]
    lowEngagementLowGrade: QuadrantStudent[]
  }
  correlation: CorrelationStats
  summary: {
    totalStudents: number
    avgActivityCount: number
    avgGrade: number
  }
}

export function useEngagementGradeCorrelation() {
  return useQuery<EngagementGradeCorrelation>({
    queryKey: ["adminReports", "engagement-grades"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/engagement-grades", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<EngagementGradeCorrelation>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Learning Velocity Report Types & Hook
export interface StudentVelocity {
  userId: string
  name: string | null
  email: string | null
  daysEnrolled: number
  topicsCompleted: number
  velocity: number
  avgScoreImprovementRate: number
  activityFrequency: number
}

export interface VelocitySummary {
  avgVelocity: number
  medianVelocity: number
  fastestStudents: Array<{ userId: string; name: string | null; velocity: number }>
  slowestStudents: Array<{ userId: string; name: string | null; velocity: number }>
  cumulativeCompletionCurve: Array<{ day: number; avgTopicsCompleted: number }>
}

export interface LearningVelocityReport {
  studentVelocities: StudentVelocity[]
  summary: VelocitySummary
}

export function useLearningVelocityReport() {
  return useQuery<LearningVelocityReport>({
    queryKey: ["adminReports", "learning-velocity"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/reports/learning-velocity", {
        timeoutMs: 15000,
      })
      return parseQueryResponse<LearningVelocityReport>(res)
    },
    staleTime: 5 * 60 * 1000,
  })
}
