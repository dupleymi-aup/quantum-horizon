"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MasteryLevel } from "@/hooks/api/use-admin-reports"

interface TopicMasteryRow {
  topic: string
  masteryDistribution: Record<MasteryLevel, number>
  avgScore: number
  totalStudents: number
  passRate: number
}

interface HeatmapTableProps {
  data: TopicMasteryRow[]
  title?: string
}

const MASTERY_LEVELS: MasteryLevel[] = ["advanced", "proficient", "developing", "beginner"]

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  advanced: "Advanced",
  proficient: "Proficient",
  developing: "Developing",
  beginner: "Beginner",
}

function getCellColor(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) return "bg-gray-50 dark:bg-gray-900"
  const ratio = count / maxCount
  if (ratio >= 0.75) return "bg-blue-200 dark:bg-blue-900"
  if (ratio >= 0.5) return "bg-blue-100 dark:bg-blue-950"
  if (ratio >= 0.25) return "bg-blue-50 dark:bg-blue-900/50"
  return "bg-gray-50 dark:bg-gray-900"
}

export function HeatmapTable({ data, title = "Topic Mastery Heatmap" }: HeatmapTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(
    ...data.flatMap((d) => MASTERY_LEVELS.map((level) => d.masteryDistribution[level] || 0))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Topic</TableHead>
                {MASTERY_LEVELS.map((level) => (
                  <TableHead key={level} className="text-center">
                    {MASTERY_LABELS[level]}
                  </TableHead>
                ))}
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Pass Rate</TableHead>
                <TableHead className="text-center">Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.topic}>
                  <TableCell className="font-medium">{row.topic.replace(/_/g, " ")}</TableCell>
                  {MASTERY_LEVELS.map((level) => {
                    const count = row.masteryDistribution[level] || 0
                    return (
                      <TableCell
                        key={level}
                        className={`text-center font-mono text-sm ${getCellColor(count, maxCount)}`}
                      >
                        {count}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-center">{row.avgScore}%</TableCell>
                  <TableCell className="text-center">{row.passRate}%</TableCell>
                  <TableCell className="text-center">{row.totalStudents}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
