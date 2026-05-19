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
import { StatCard, ScatterChartComponent } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin/admin-skeleton"
import { useLearningVelocityReport } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildMultiSectionCSV, downloadCSV } from "@/lib/csv"
import { Download, Zap, TrendingUp, Timer } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function AdminLearningVelocityReportPage() {
  const { data, isLoading, error, refetch } = useLearningVelocityReport()

  const handleExportCSV = () => {
    if (!data?.studentVelocities.length) return

    const sections = [
      {
        title: "Student Learning Velocities",
        headers: [
          "Name",
          "Email",
          "Days Enrolled",
          "Topics Completed",
          "Velocity (topics/30d)",
          "Score Improvement",
          "Activity Frequency (per 30d)",
        ],
        rows: data.studentVelocities.map((s) => [
          escapeCSV(s.name || "Unknown"),
          escapeCSV(s.email || ""),
          String(s.daysEnrolled),
          String(s.topicsCompleted),
          String(s.velocity),
          String(s.avgScoreImprovementRate),
          String(s.activityFrequency),
        ]),
      },
      {
        title: "Summary Statistics",
        headers: ["Metric", "Value"],
        rows: [
          ["Average Velocity", String(data.summary.avgVelocity)],
          ["Median Velocity", String(data.summary.medianVelocity)],
        ],
      },
    ]

    downloadCSV(buildMultiSectionCSV(sections), "learning_velocity_report.csv")
  }

  if (error) {
    return (
      <AdminError
        message="Failed to load learning velocity report"
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

  if (!data || data.studentVelocities.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Learning Velocity Report</h2>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scatterPoints = data.studentVelocities.map((s) => ({
    x: s.daysEnrolled,
    y: s.topicsCompleted,
    label: s.name || "Unknown",
    userId: s.userId,
  }))

  const velocityHistogram = data.studentVelocities.map((s) => ({
    name: s.name || "Unknown",
    velocity: s.velocity,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Learning Velocity Report</h2>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Zap}
          label="Avg Velocity"
          value={`${data.summary.avgVelocity} topics/30d`}
        />
        <StatCard
          icon={Zap}
          label="Median Velocity"
          value={`${data.summary.medianVelocity} topics/30d`}
        />
        <StatCard
          icon={TrendingUp}
          label="Fastest Student"
          value={data.summary.fastestStudents[0]?.name || "—"}
        />
        <StatCard
          icon={Timer}
          label="Total Students"
          value={data.studentVelocities.length}
        />
      </div>

      <ScatterChartComponent
        data={scatterPoints}
        title="Days Enrolled vs Topics Completed"
        xLabel="Days Enrolled"
        yLabel="Topics Completed"
        showRegression
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fastest Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.summary.fastestStudents.map((student, i) => (
                <div
                  key={student.userId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold w-6">{i + 1}</span>
                    <span>{student.name || "Unknown"}</span>
                  </div>
                  <span className="font-mono text-sm">{student.velocity} topics/30d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slowest Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.summary.slowestStudents.map((student, i) => (
                <div
                  key={student.userId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold w-6">{i + 1}</span>
                    <span>{student.name || "Unknown"}</span>
                  </div>
                  <span className="font-mono text-sm">{student.velocity} topics/30d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative Completion Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  data={data.summary.cumulativeCompletionCurve.map((p) => ({
                    date: `Day ${p.day}`,
                    avgScore: p.avgTopicsCompleted,
                  }))}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Velocities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Days Enrolled</TableHead>
                  <TableHead className="text-center">Topics</TableHead>
                  <TableHead className="text-center">Velocity</TableHead>
                  <TableHead className="text-center">Score Δ</TableHead>
                  <TableHead className="text-center">Activity/30d</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.studentVelocities.map((student) => (
                  <TableRow key={student.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{student.daysEnrolled}</TableCell>
                    <TableCell className="text-center">{student.topicsCompleted}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {student.velocity}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          student.avgScoreImprovementRate > 0
                            ? "text-green-600"
                            : student.avgScoreImprovementRate < 0
                              ? "text-red-600"
                              : ""
                        }
                      >
                        {student.avgScoreImprovementRate > 0 ? "+" : ""}
                        {student.avgScoreImprovementRate}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{student.activityFrequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
