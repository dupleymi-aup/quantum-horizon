"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard, ScatterChartComponent } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin/admin-skeleton"
import { useEngagementGradeCorrelation } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildMultiSectionCSV, downloadCSV } from "@/lib/csv"
import { Download, TrendingUp, Users } from "lucide-react"

function getQuadrantLabel(key: string): string {
  const labels: Record<string, string> = {
    highEngagementHighGrade: "High Engagement / High Grades",
    highEngagementLowGrade: "High Engagement / Low Grades",
    lowEngagementHighGrade: "Low Engagement / High Grades",
    lowEngagementLowGrade: "Low Engagement / Low Grades",
  }
  return labels[key] || key
}

function getQuadrantColor(key: string): string {
  const colors: Record<string, string> = {
    highEngagementHighGrade: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
    highEngagementLowGrade: "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400",
    lowEngagementHighGrade: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    lowEngagementLowGrade: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
  }
  return colors[key] || ""
}

export default function AdminEngagementGradeReportPage() {
  const { data, isLoading, error, refetch } = useEngagementGradeCorrelation()

  const handleExportCSV = () => {
    if (!data?.scatterData.length) return

    const sections = [
      {
        title: "Engagement-Grade Data",
        headers: ["Name", "Activities", "Session Minutes", "XP", "Avg Grade", "Assessments"],
        rows: data.scatterData.map((d) => [
          escapeCSV(d.name || "Unknown"),
          String(d.activityCount),
          String(d.totalSessionMinutes),
          String(d.totalXp),
          String(d.avgGrade),
          String(d.assessmentCount),
        ]),
      },
      {
        title: "Correlation Statistics",
        headers: ["Metric", "Value"],
        rows: [
          ["Activity-Grade Correlation", String(data.correlation.activityGradeCorrelation)],
          ["Session-Grade Correlation", String(data.correlation.sessionGradeCorrelation)],
        ],
      },
    ]

    for (const [key, students] of Object.entries(data.quadrants)) {
      if (students.length === 0) continue
      sections.push({
        title: getQuadrantLabel(key),
        headers: ["Name", "Avg Grade", "Activities"],
        rows: students.map((s) => [
          escapeCSV(s.name || "Unknown"),
          String(s.avgGrade),
          String(s.activityCount),
        ]),
      })
    }

    downloadCSV(buildMultiSectionCSV(sections), "engagement_grade_correlation.csv")
  }

  if (error) {
    return (
      <AdminError
        message="Failed to load engagement-grade correlation report"
        onRetry={() => void refetch()}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <AdminStatCardSkeleton key={i} />
          ))}
        </div>
        <AdminChartSkeleton />
        <AdminChartSkeleton />
      </div>
    )
  }

  if (!data || data.scatterData.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Engagement & Grade Correlation</h2>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scatterPoints = data.scatterData.map((d) => ({
    x: d.activityCount,
    y: d.avgGrade,
    label: d.name || "Unknown",
    userId: d.userId,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Engagement & Grade Correlation</h2>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={data.summary.totalStudents} />
        <StatCard icon={TrendingUp} label="Avg Activity Count" value={data.summary.avgActivityCount} />
        <StatCard icon={TrendingUp} label="Avg Grade" value={`${data.summary.avgGrade}%`} />
        <StatCard
          icon={TrendingUp}
          label="Correlation"
          value={String(data.correlation.activityGradeCorrelation)}
        />
      </div>

      <ScatterChartComponent
        data={scatterPoints}
        title="Activity Count vs Average Grade"
        xLabel="Activities"
        yLabel="Avg Grade (%)"
        showRegression
      />

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(data.quadrants).map(([key, students]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm">
                <Badge className={getQuadrantColor(key)}>{getQuadrantLabel(key)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No students</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.userId}
                      className="flex justify-between items-center text-sm py-1"
                    >
                      <span className="font-medium truncate">
                        {student.name || "Unknown"}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {student.avgGrade}% · {student.activityCount} activities
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
