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
import { useStudentPerformanceReport, type MasteryLevel } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildCSV, downloadCSV } from "@/lib/csv"
import { Search, X, TrendingUp, Award, AlertTriangle, FileText, Download, Target, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { escapeCSV, buildCSV, downloadCSV } from "@/lib/csv"

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  advanced: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
  proficient: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  developing: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400",
  beginner: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
}

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  advanced: "Advanced",
  proficient: "Proficient",
  developing: "Developing",
  beginner: "Beginner",
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export default function AdminStudentPerformanceReportPage() {
  const [selectedId, setSelectedId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [page, setPage] = useState(1)

  const { data: usersData, isLoading: usersLoading } = useAdminUsersList(page, search)
  const { data, isLoading, error, refetch } = useStudentPerformanceReport(selectedId)

  const handleSearch = () => {
    setSearch(inputValue)
    setPage(1)
  }

  const handleExportCSV = () => {
    if (!data?.byTopic.length) return
    const headers = ["Topic", "First Score", "Latest Score", "Improvement", "Avg Score", "Mastery", "Class Avg", "vs Class Avg", "Assessments"]
    const rows = data.byTopic.map((t) => [
      escapeCSV(t.topic),
      String(t.firstScore),
      String(t.latestScore),
      String(t.improvement),
      String(t.avgScore),
      t.mastery,
      String(t.classAvg),
      String(t.vsClassAvg),
      String(t.assessmentsTaken),
    ])
    downloadCSV(buildCSV(headers, rows), `student_performance_${data.student.name ?? selectedId.slice(-4)}.csv`)
  }

  if (error) {
    return <AdminError message="Failed to load student performance report" onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Performance Report</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedId && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="default" className="gap-1">
                {usersData?.users.find((u) => u.id === selectedId)?.name ?? selectedId.slice(-4)}
                <button onClick={() => { setSelectedId("") }} className="ml-1 hover:text-red-300">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Search students..."
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
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
                  onClick={() => { setSelectedId(u.id) }}
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
            <p className="text-muted-foreground mt-4 text-sm">Select a student to view detailed performance report</p>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <AdminStatCardSkeleton key={i} />)}
          </div>
          <AdminChartSkeleton title="Grade Timeline" />
          <AdminTableSkeleton rows={5} />
        </div>
      )}

      {data && data.overall.totalTaken > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {data.student.name ?? "Student"} — Performance Summary
            </h3>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={TrendingUp} label="Average Score" value={`${String(data.overall.avgScore)}%`} />
            <StatCard icon={Award} label="Best Score" value={`${String(data.overall.bestScore)}%`} />
            <StatCard icon={AlertTriangle} label="Worst Score" value={`${String(data.overall.worstScore)}%`} />
            <StatCard icon={FileText} label="Assessments" value={data.overall.totalTaken} />
            <StatCard icon={Target} label="Mastery" value={MASTERY_LABELS[data.overall.overallMastery]} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Class Percentile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.classPercentile !== null ? `${String(data.classPercentile)}th` : "N/A"}</p>
                <p className="text-xs text-muted-foreground">Higher is better</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.overall.totalXp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{data.overall.activityCount} activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                {data.trendDirection === "improving" && <ArrowUp className="h-6 w-6 text-green-500" />}
                {data.trendDirection === "declining" && <ArrowDown className="h-6 w-6 text-red-500" />}
                {data.trendDirection === "stable" && <Minus className="h-6 w-6 text-yellow-500" />}
                <span className="text-lg font-semibold capitalize">{data.trendDirection}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Strongest Topic</CardTitle>
              </CardHeader>
              <CardContent>
                {data.strongestTopic ? (
                  <>
                    <p className="text-lg font-semibold truncate">{data.strongestTopic.topic}</p>
                    <p className="text-xs text-muted-foreground">{data.strongestTopic.avgScore}% — {MASTERY_LABELS[data.strongestTopic.mastery]}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">N/A</p>
                )}
              </CardContent>
            </Card>
          </div>

          <GradeTrendLineChart
            data={data.timeline.map((t) => ({ date: t.date, avgScore: t.score }))}
            title={`Grade Timeline — ${data.student.name ?? "Student"}`}
          />

          {data.weakestTopic && (
            <Card className="border-yellow-200 dark:border-yellow-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Area for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{data.weakestTopic.topic}</p>
                <p className="text-sm text-muted-foreground">
                  Average score: {data.weakestTopic.avgScore}% — {MASTERY_LABELS[data.weakestTopic.mastery]} level. Recommend additional practice.
                </p>
              </CardContent>
            </Card>
          )}

          {data.byTopic.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
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
                      <TableHead className="text-right">Mastery</TableHead>
                      <TableHead className="text-right">Class Avg</TableHead>
                      <TableHead className="text-right">vs Class</TableHead>
                      <TableHead className="text-right">Taken</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byTopic.map((t) => (
                      <TableRow key={t.topic}>
                        <TableCell className="font-medium">{t.topic}</TableCell>
                        <TableCell className="text-right">{t.firstScore}%</TableCell>
                        <TableCell className="text-right">{t.latestScore}%</TableCell>
                        <TableCell className="text-right">
                          <span className={
                            t.improvement > 0 ? "text-green-600" : t.improvement < 0 ? "text-red-600" : "text-muted-foreground"
                          }>
                            {t.improvement > 0 ? "▲" : t.improvement < 0 ? "▼" : "—"} {Math.abs(t.improvement)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={
                            t.avgScore >= 70 ? "text-green-600" : t.avgScore >= 50 ? "text-yellow-600" : "text-red-600"
                          }>{t.avgScore}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={MASTERY_COLORS[t.mastery]}>
                            {MASTERY_LABELS[t.mastery]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{t.classAvg}%</TableCell>
                        <TableCell className="text-right">
                          <span className={
                            t.vsClassAvg > 0 ? "text-green-600" : t.vsClassAvg < 0 ? "text-red-600" : "text-muted-foreground"
                          }>
                            {t.vsClassAvg > 0 ? "+" : ""}{t.vsClassAvg}%
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
            <p className="text-muted-foreground text-center text-sm">No grades recorded for this student</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
