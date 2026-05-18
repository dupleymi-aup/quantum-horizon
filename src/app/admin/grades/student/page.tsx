"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatCard, GradeTrendLineChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import {
  AdminStatCardSkeleton,
  AdminChartSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-skeleton"
import { useAdminUsersList, type AdminUser } from "@/hooks/api/use-admin-analytics"
import { useStudentGradeAnalytics } from "@/hooks/api/use-admin-analytics"
import { Search, X, TrendingUp, Award, AlertTriangle, FileText } from "lucide-react"

export default function AdminStudentGradesPage() {
  const [selectedId, setSelectedId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [page, setPage] = useState(1)

  const { data: usersData, isLoading: usersLoading } = useAdminUsersList(page, search)
  const { data, isLoading, error, refetch } = useStudentGradeAnalytics(selectedId)

  const handleSearch = () => {
    setSearch(inputValue)
    setPage(1)
  }

  if (error) {
    return <AdminError message="Failed to load student grade data" onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedId && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="default" className="gap-1">
                {usersData?.users.find((u) => u.id === selectedId)?.name ?? selectedId.slice(-4)}
                <button
                  onClick={() => {
                    setSelectedId("")
                  }}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Search students..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="max-w-sm"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {usersLoading ? (
            <p className="text-muted-foreground text-sm">Loading users...</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
              {usersData?.users.map((u: AdminUser) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedId(u.id)
                  }}
                  className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
                    selectedId === u.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  }`}
                >
                  {u.name ?? u.email ?? u.id.slice(-6)}
                  <span className="text-muted-foreground ml-2 text-xs">XP: {u.totalXp}</span>
                </button>
              ))}
            </div>
          )}

          {!selectedId && (
            <p className="text-muted-foreground mt-4 text-sm">
              Select a student to view grade history
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading / Empty States */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <AdminStatCardSkeleton key={i} />
            ))}
          </div>
          <AdminChartSkeleton title="Grade Timeline" />
          <AdminTableSkeleton rows={5} />
        </div>
      )}

      {/* Student Grade Data */}
      {data && data.overall.totalTaken > 0 && (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Average Score"
              value={`${String(data.overall.avgScore)}%`}
            />
            <StatCard
              icon={Award}
              label="Best Score"
              value={`${String(data.overall.bestScore)}%`}
            />
            <StatCard
              icon={AlertTriangle}
              label="Worst Score"
              value={`${String(data.overall.worstScore)}%`}
            />
            <StatCard icon={FileText} label="Assessments Taken" value={data.overall.totalTaken} />
          </div>

          {/* Grade Timeline */}
          <GradeTrendLineChart
            data={data.timeline.map((t) => ({ date: t.date, avgScore: t.score }))}
            title={`Grade Timeline — ${data.student.name ?? data.student.email ?? "Student"}`}
          />

          {/* Grade Improvement by Topic */}
          {data.byTopic.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Improvement by Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">First Score</TableHead>
                      <TableHead className="text-right">Latest Score</TableHead>
                      <TableHead className="text-right">Improvement</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byTopic.map((t) => (
                      <TableRow key={t.topic}>
                        <TableCell className="font-medium">{t.topic}</TableCell>
                        <TableCell className="text-right">{t.firstScore}%</TableCell>
                        <TableCell className="text-right">{t.latestScore}%</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              t.improvement > 0
                                ? "text-green-600"
                                : t.improvement < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                            }
                          >
                            {t.improvement > 0 ? "▲" : t.improvement < 0 ? "▼" : "—"}{" "}
                            {Math.abs(t.improvement)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              t.avgScore >= 70
                                ? "text-green-600"
                                : t.avgScore >= 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }
                          >
                            {t.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{t.assessmentsTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {data?.overall.totalTaken === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center text-sm">
              No grades recorded for this student
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
