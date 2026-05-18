"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TopicStat } from "@/hooks/api/use-admin-analytics"

function getBarColor(rate: number): string {
  if (rate >= 70) return "#22c55e"
  if (rate >= 30) return "#f59e0b"
  return "#ef4444"
}

interface ProgressBarChartProps {
  data: TopicStat[]
  title?: string
}

export function ProgressBarChart({ data, title = "Topic Completion Rates" }: ProgressBarChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">No progress data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    topic: d.topic.length > 20 ? d.topic.slice(0, 20) + "..." : d.topic,
    completionRate: d.completionRate,
    fill: getBarColor(d.completionRate),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={120} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} name="Completion Rate">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${String(index)}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
