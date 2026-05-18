"use client"

import { useState } from "react"
import {
  GradeTrendLineChart,
  GradeDistributionChart,
  ProgressBarChart,
  StatCard,
} from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import {
  AdminStatCardSkeleton,
  AdminChartSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminGradesOverview } from "@/hooks/api/use-admin-analytics"
import { FileText, Percent, TrendingUp, CheckCircle } from "lucide-react"

type SortKey = "title" | "avgScore" | "count" | "stdDev"

export default function AdminGradesPage() {
  const { data, isLoading, error, refetch } = useAdminGradesOverview()
  const [sortKey, setSortKey] = useState<SortKey>("avgScore")
  const [sortAsc, setSortAsc] = useState(true)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const sortedDifficulty = data?.assessmentDifficulty
    ? [...data.assessmentDifficulty].sort((a, b) => {
        const mul = sortAsc ? 1 : -1
        if (sortKey === "title") return mul * a.title.localeCompare(b.title)
        return mul * (a[sortKey] - b[sortKey])
      })
    : []

  if (error) {
    return <AdminError message="Failed to load grade analytics" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Grade Trends</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminStatCardSkeleton key={i} />
          ))}
        </div>
        <AdminChartSkeleton title="Grade Trends Over Time" />
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminChartSkeleton title="Grade Distribution" />
          <AdminChartSkeleton title="Average Grades by Topic" />
        </div>
        <AdminTableSkeleton rows={5} />
      </div>
    )
  }

  const topicProgressData = (data?.avgByTopic ?? []).map((t) => ({
    topic: t.topic,
    completionRate: t.avgScore,
    avgProgress: t.avgScore,
    totalUsers: 0,
    bookmarkCount: 0,
    lastActivity: null,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Grade Trends</h2>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total Assessments" value={data?.totalAssessments ?? 0} />
        <StatCard icon={Percent} label="Total Grades" value={data?.totalGrades ?? 0} />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${String(data?.avgScorePercentage ?? 0)}%`}
        />
        <StatCard icon={CheckCircle} label="Pass Rate" value={`${String(data?.passRate ?? 0)}%`} />
      </div>

      {/* Grade Trend Chart */}
      <GradeTrendLineChart data={data?.trendsOverTime ?? []} />

      {/* Distribution + Topic */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GradeDistributionChart data={data?.gradeDistribution ?? []} />
        <ProgressBarChart data={topicProgressData} title="Average Grades by Topic" />
      </div>

      {/* Assessment Difficulty Table */}
      {sortedDifficulty.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      handleSort("title")
                    }}
                  >
                    Assessment {sortKey === "title" && (sortAsc ? "▲" : "▼")}
                  </TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => {
                      handleSort("avgScore")
                    }}
                  >
                    Avg Score {sortKey === "avgScore" && (sortAsc ? "▲" : "▼")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => {
                      handleSort("count")
                    }}
                  >
                    Grades {sortKey === "count" && (sortAsc ? "▲" : "▼")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => {
                      handleSort("stdDev")
                    }}
                  >
                    Std Dev {sortKey === "stdDev" && (sortAsc ? "▲" : "▼")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDifficulty.map((a, i) => (
                  <TableRow key={`${a.title}-${String(i)}`}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{a.topic}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          a.avgScore >= 70
                            ? "text-green-600"
                            : a.avgScore >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {a.avgScore}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{a.count}</TableCell>
                    <TableCell className="text-right">{a.stdDev}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
