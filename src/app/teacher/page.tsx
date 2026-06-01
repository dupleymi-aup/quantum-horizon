"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { BarChart, BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react"

interface DashboardStats {
  assessmentsCount: number
  gradesCount: number
  avgScore: number
  uniqueStudentsCount: number
}

interface RecentGrade {
  id: string
  studentName: string
  assessmentTitle: string
  topic: string
  score: number
  maxScore: number
  percentage: number
  completedAt: string
}

interface TopicStat {
  topic: string
  count: number
}

async function fetchTeacherDashboard(): Promise<{
  stats: DashboardStats
  recentGrades: RecentGrade[]
  topTopics: TopicStat[]
}> {
  const res = await fetch("/api/teacher/dashboard")
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json() as Promise<{
    stats: DashboardStats
    recentGrades: RecentGrade[]
    topTopics: TopicStat[]
  }>
}

export default function TeacherDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher-dashboard"],
    queryFn: fetchTeacherDashboard,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Ошибка загрузки данных</p>
      </div>
    )
  }

  const stats: DashboardStats = data?.stats ?? {
    assessmentsCount: 0,
    gradesCount: 0,
    avgScore: 0,
    uniqueStudentsCount: 0,
  }
  const recentGrades: RecentGrade[] = data?.recentGrades ?? []
  const topTopics: TopicStat[] = data?.topTopics ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель преподавателя</h1>
        <p className="text-muted-foreground mt-1">Управление тестами и оценками студентов</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего тестов</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessmentsCount}</div>
            <p className="text-muted-foreground text-xs">Созданных вами тестов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Оценок выставлено</CardTitle>
            <BarChart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradesCount}</div>
            <p className="text-muted-foreground text-xs">Всего оценок</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgScore)}</div>
            <p className="text-muted-foreground text-xs">Средний балл по всем тестам</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Студентов</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueStudentsCount}</div>
            <p className="text-muted-foreground text-xs">Уникальных студентов</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle>Последние оценки</CardTitle>
            <CardDescription>Недавние оценки студентов</CardDescription>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <p className="text-muted-foreground text-sm">Пока нет оценок</p>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between border-b pb-2">
                    <div className="space-y-1">
                      <p className="font-medium">{grade.studentName}</p>
                      <p className="text-muted-foreground text-sm">{grade.assessmentTitle}</p>
                      <Badge variant="secondary">{grade.topic}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {grade.score}/{grade.maxScore}
                      </p>
                      <p
                        className={`text-sm ${
                          grade.percentage >= 80
                            ? "text-green-600"
                            : grade.percentage >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {grade.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Популярные темы</CardTitle>
            <CardDescription>Темы с наибольшим количеством тестов</CardDescription>
          </CardHeader>
          <CardContent>
            {topTopics.length === 0 ? (
              <p className="text-muted-foreground text-sm">Пока нет тем</p>
            ) : (
              <div className="space-y-3">
                {topTopics.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">{topic.topic}</span>
                    </div>
                    <Badge variant="outline">{topic.count} тестов</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
