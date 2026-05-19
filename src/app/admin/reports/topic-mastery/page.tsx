"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard, HeatmapTable, GradeTrendLineChart, GradeDistributionChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin/admin-skeleton"
import { useTopicMasteryReport, type MasteryLevel } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildMultiSectionCSV, downloadCSV } from "@/lib/csv"
import { Download, BookOpen } from "lucide-react"

export default function AdminTopicMasteryReportPage() {
  const { data, isLoading, error, refetch } = useTopicMasteryReport()

  const handleExportCSV = () => {
    if (!data?.topics.length) return

    const sections = [
      {
        title: "Topic Mastery Distribution",
        headers: [
          "Topic",
          "Advanced",
          "Proficient",
          "Developing",
          "Beginner",
          "Avg Score",
          "Pass Rate",
          "Students",
        ],
        rows: data.topics.map((t) => [
          escapeCSV(t.topic),
          String(t.masteryDistribution.advanced),
          String(t.masteryDistribution.proficient),
          String(t.masteryDistribution.developing),
          String(t.masteryDistribution.beginner),
          String(t.avgScore),
          String(t.passRate),
          String(t.totalStudents),
        ]),
      },
      {
        title: "Overall Mastery Distribution",
        headers: ["Advanced", "Proficient", "Developing", "Beginner"],
        rows: [
          [
            String(data.overallMasteryDistribution.advanced),
            String(data.overallMasteryDistribution.proficient),
            String(data.overallMasteryDistribution.developing),
            String(data.overallMasteryDistribution.beginner),
          ],
        ],
      },
    ]

    downloadCSV(buildMultiSectionCSV(sections), "topic_mastery_report.csv")
  }

  if (error) {
    return <AdminError message="Failed to load topic mastery report" onRetry={() => void refetch()} />
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

  if (!data || data.topics.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Topic Mastery Heatmap</h2>
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalStudents = Object.values(data.overallMasteryDistribution).reduce(
    (a, b) => a + b,
    0
  )
  const avgScore = Math.round(
    data.topics.reduce((a, t) => a + t.avgScore, 0) / data.topics.length
  )
  const avgPassRate = Math.round(
    data.topics.reduce((a, t) => a + t.passRate, 0) / data.topics.length
  )
  const weakestTopic = data.topics[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Topic Mastery Heatmap</h2>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Topics" value={data.topics.length} />
        <StatCard icon={BookOpen} label="Total Students" value={totalStudents} />
        <StatCard icon={BookOpen} label="Avg Score" value={`${avgScore}%`} />
        <StatCard icon={BookOpen} label="Avg Pass Rate" value={`${avgPassRate}%`} />
      </div>

      {data.overallMasteryDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Mastery Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              {(["advanced", "proficient", "developing", "beginner"] as MasteryLevel[]).map(
                (level) => (
                  <Card key={level} className="text-center">
                    <CardContent className="pt-4">
                      <p className="text-2xl font-semibold">
                        {data.overallMasteryDistribution[level]}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{level}</p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <HeatmapTable
        data={data.topics}
        title="Topic Mastery Heatmap"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Difficulty Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topics.map((topic) => (
                <div key={topic.topic} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate">
                    {topic.topic.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        topic.avgScore >= 85
                          ? "bg-green-500"
                          : topic.avgScore >= 70
                            ? "bg-blue-500"
                            : topic.avgScore >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${topic.avgScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-12 text-right">
                    {topic.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.topics.length >= 1 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Weakest Topic Trend: {weakestTopic.topic.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradeTrendLineChart data={weakestTopic.trend} title="" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
