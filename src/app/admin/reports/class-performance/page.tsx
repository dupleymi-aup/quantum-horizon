"use client"

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
import { StatCard, GradeTrendLineChart, GradeDistributionChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import {
  AdminStatCardSkeleton,
  AdminChartSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-skeleton"
import { useClassPerformanceReport } from "@/hooks/api/use-admin-reports"
import { Download, Users, CheckCircle, Award, TrendingUp, AlertTriangle, FileText } from "lucide-react"

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export default function AdminClassPerformanceReportPage() {
  const { data, isLoading, error, refetch } = useClassPerformanceReport()

  const handleExportCSV = () => {
    if (!data) return

    const sections: string[] = []

    sections.push("Class Performance Report")
    sections.push(`Generated: ${new Date().toLocaleDateString()}`)
    sections.push("")

    sections.push("Overall Statistics")
    sections.push(`Total Students,${String(data.totalStudents)}`)
    sections.push(`Graded Students,${String(data.gradedStudentCount)}`)
    sections.push(`Average Score,${String(data.overall.avgScore)}%`)
    sections.push(`Min Score,${String(data.overall.minScore)}%`)
    sections.push(`Max Score,${String(data.overall.maxScore)}%`)
    sections.push(`Pass Rate,${String(data.overall.passRate)}%`)
    sections.push(`Total Grades,${String(data.overall.totalGrades)}`)
    sections.push("")

    sections.push("Grade Distribution")
    sections.push("Range,Count")
    for (const d of data.gradeDistribution) {
      sections.push(`${d.range},${String(d.count)}`)
    }
    sections.push("")

    sections.push("Performance by Topic")
    sections.push("Topic,Avg Score,Attempts,Pass Rate")
    for (const t of data.byTopic) {
      sections.push(`${escapeCSV(t.topic)},${String(t.avgScore)}%,${String(t.totalAttempts)},${String(t.passRate)}%`)
    }
    sections.push("")

    sections.push("Top Students")
    sections.push("Rank,Name,Avg Score,Assessments")
    for (let i = 0; i < data.topStudents.length; i++) {
      const s = data.topStudents[i]
      sections.push(`${String(i + 1)},${escapeCSV(s.name)},${String(s.avgScore)}%,${String(s.assessmentsTaken)}`)
    }

    const csv = sections.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "class_performance_report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return <AdminError message="Failed to load class performance report" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-7 w-48 rounded" />
          <div className="bg-muted h-9 w-28 rounded" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <AdminStatCardSkeleton key={i} />)}
        </div>
        <AdminChartSkeleton title="Grade Distribution" />
        <AdminTableSkeleton rows={5} />
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminTableSkeleton rows={5} />
          <AdminTableSkeleton rows={5} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Class Performance Report</h2>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Students" value={data?.totalStudents ?? 0} />
        <StatCard icon={CheckCircle} label="Graded" value={data?.gradedStudentCount ?? 0} />
        <StatCard icon={Award} label="Avg Score" value={data ? `${String(data.overall.avgScore)}%` : "0%"} />
        <StatCard icon={TrendingUp} label="Pass Rate" value={data ? `${String(data.overall.passRate)}%` : "0%"} />
        <StatCard icon={FileText} label="Total Grades" value={data?.overall.totalGrades ?? 0} />
      </div>

      {data && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <GradeDistributionChart data={data.gradeDistribution} />
              </CardContent>
            </Card>

            {data.trendsOverTime.length > 0 && (
              <GradeTrendLineChart
                data={data.trendsOverTime.map((t) => ({ date: t.date, avgScore: t.avgScore }))}
                title="Class Average Over Time"
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Pass Rate</TableHead>
                    <TableHead className="text-right">Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byTopic.map((t) => (
                    <TableRow key={t.topic}>
                      <TableCell className="font-medium">{t.topic}</TableCell>
                      <TableCell className="text-right">
                        <span className={t.avgScore >= 70 ? "text-green-600" : t.avgScore >= 50 ? "text-yellow-600" : "text-red-600"}>
                          {String(t.avgScore)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={t.passRate >= 70 ? "text-green-600" : t.passRate >= 50 ? "text-yellow-600" : "text-red-600"}>
                          {t.passRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{t.totalAttempts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-500" />
                  Top Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topStudents.map((s, i) => (
                      <TableRow key={s.userId}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-right text-green-600">{s.avgScore}%</TableCell>
                        <TableCell className="text-right">{s.assessmentsTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Assessments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.bottomStudents.map((s, i) => (
                      <TableRow key={s.userId}>
                        <TableCell className="font-medium text-muted-foreground">{data.topStudents.length + i + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-right text-red-600">{s.avgScore}%</TableCell>
                        <TableCell className="text-right">{s.assessmentsTaken}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {data.mostDifficultAssessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Most Difficult Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Attempts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.mostDifficultAssessments.map((a, i) => (
                      <TableRow key={`${a.title}-${String(i)}`}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>{a.topic}</TableCell>
                        <TableCell className="text-right">
                          <span className={a.avgScore >= 70 ? "text-green-600" : a.avgScore >= 50 ? "text-yellow-600" : "text-red-600"}>
                            {String(a.avgScore)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{a.attempts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
