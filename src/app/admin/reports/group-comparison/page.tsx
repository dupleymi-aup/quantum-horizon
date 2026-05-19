"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard, ProgressBarChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminChartSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeleton"
import { useGroupComparisonReport } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildMultiSectionCSV, downloadCSV } from "@/lib/csv"
import { Download, Users, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const GROUP_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
]

export default function AdminGroupComparisonReportPage() {
  const { data, isLoading, error, refetch } = useGroupComparisonReport()
  const [selectedGroup, setSelectedGroup] = useState<string>("all")

  const handleExportCSV = () => {
    if (!data?.groups.length) return

    const sections = [
      {
        title: "Group Comparison Summary",
        headers: ["Group", "Members", "Avg Score", "Pass Rate", "Total Grades", "Active Students"],
        rows: data.groups.map((g) => [
          escapeCSV(g.name),
          String(g.memberCount),
          String(g.avgScore),
          String(g.passRate),
          String(g.totalGrades),
          String(g.activeStudents),
        ]),
      },
      {
        title: "Topic Performance by Group",
        headers: ["Group", "Topic", "Avg Score", "Pass Rate"],
        rows: data.groups.flatMap((g) =>
          g.byTopic.map((t) => [
            escapeCSV(g.name),
            escapeCSV(t.topic),
            String(t.avgScore),
            String(t.passRate),
          ])
        ),
      },
    ]

    downloadCSV(buildMultiSectionCSV(sections), "group_comparison_report.csv")
  }

  if (error) {
    return <AdminError message="Failed to load group comparison report" onRetry={() => void refetch()} />
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
        <AdminTableSkeleton />
      </div>
    )
  }

  if (!data || data.groups.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Student Group Comparison</h2>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm text-center py-8">
              No student groups found
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalGroups = data.groups.length
  const totalStudents = data.groups.reduce((a, g) => a + g.memberCount, 0)
  const overallAvg = Math.round(
    data.groups.reduce((a, g) => a + g.avgScore, 0) / data.groups.length
  )
  const overallPassRate = Math.round(
    data.groups.reduce((a, g) => a + g.passRate, 0) / data.groups.length
  )

  const bestGroup = data.groups.reduce((best, g) =>
    g.avgScore > best.avgScore ? g : best
  )

  const allTopics = new Set(data.groups.flatMap((g) => g.byTopic.map((t) => t.topic)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Group Comparison</h2>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Groups" value={totalGroups} />
        <StatCard icon={Users} label="Total Students" value={totalStudents} />
        <StatCard icon={TrendingUp} label="Overall Avg Score" value={`${overallAvg}%`} />
        <StatCard icon={TrendingUp} label="Overall Pass Rate" value={`${overallPassRate}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Trends by Group</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {data.groups
                .filter((g) => selectedGroup === "all" || g.id === selectedGroup)
                .map((group, idx) => (
                  <Line
                    key={group.id}
                    type="monotone"
                    dataKey="avgScore"
                    data={group.trendsOverTime.map((t) => ({
                      date: t.date.slice(5),
                      avgScore: t.avgScore,
                    }))}
                    name={group.name}
                    stroke={GROUP_COLORS[idx % GROUP_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {data.groups.length > 1 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-base">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{group.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-semibold">{group.memberCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Score</p>
                    <p className="font-semibold">{group.avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pass Rate</p>
                    <p className="font-semibold">{group.passRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active</p>
                    <p className="font-semibold">{group.activeStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Topic Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(allTopics).map((topic) => (
              <div key={topic}>
                <h4 className="text-sm font-medium mb-2">{topic.replace(/_/g, " ")}</h4>
                <div className="space-y-1">
                  {data.groups.map((group) => {
                    const topicData = group.byTopic.find((t) => t.topic === topic)
                    if (!topicData) return null
                    return (
                      <div key={group.id} className="flex items-center gap-2">
                        <span className="text-xs w-24 truncate">{group.name}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${topicData.avgScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right">
                          {topicData.avgScore}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
