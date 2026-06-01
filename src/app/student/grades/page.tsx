"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, TrendingUp } from "lucide-react"

interface Grade {
  id: string
  assessmentId: string
  title: string
  description: string | null
  topic: string
  score: number
  maxScore: number
  percentage: number
  completedAt: string
}

interface Stats {
  total: number
  avgScore: number
  maxScore: number
  minScore: number
  avgPercentage: number
}

async function fetchStudentGrades(): Promise<{
  grades: Grade[]
  stats: Stats
}> {
  const res = await fetch("/api/student/grades")
  if (!res.ok) throw new Error("Failed to fetch grades")
  return res.json() as Promise<{ grades: Grade[]; stats: Stats }>
}

export default function StudentGradesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["student-grades"],
    queryFn: fetchStudentGrades,
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

  const grades: Grade[] = data?.grades ?? []
  const stats: Stats = data?.stats ?? {
    total: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
    avgPercentage: 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мои оценки</h1>
        <p className="text-muted-foreground mt-1">Результаты тестов и заданий</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего оценок</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgScore)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Максимум</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.maxScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Минимум</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.minScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grades List */}
      <Card>
        <CardHeader>
          <CardTitle>Все оценки</CardTitle>
          <CardDescription>Ваши результаты по всем тестам</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-muted-foreground text-sm">Пока нет оценок</p>
          ) : (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between border-b pb-3">
                  <div className="space-y-1">
                    <p className="font-medium">{grade.title}</p>
                    {grade.description && (
                      <p className="text-muted-foreground text-sm">{grade.description}</p>
                    )}
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
                    <p className="text-muted-foreground text-xs">
                      {new Date(grade.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
