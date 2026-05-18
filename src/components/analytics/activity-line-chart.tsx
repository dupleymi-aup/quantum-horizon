"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ActivityDailyData } from "@/hooks/api/use-admin-analytics"

const COLORS = {
  visualizationViews: "#3b82f6",
  lessonsCompleted: "#22c55e",
  quizzesPassed: "#a855f7",
  quizzesFailed: "#ef4444",
  achievementUnlocks: "#f59e0b",
}

interface ActivityLineChartProps {
  data: ActivityDailyData[]
  title?: string
}

export function ActivityLineChart({ data, title = "Activity Over Time" }: ActivityLineChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="visualizationViews"
              stroke={COLORS.visualizationViews}
              strokeWidth={2}
              dot={false}
              name="Views"
            />
            <Line
              type="monotone"
              dataKey="lessonsCompleted"
              stroke={COLORS.lessonsCompleted}
              strokeWidth={2}
              dot={false}
              name="Lessons"
            />
            <Line
              type="monotone"
              dataKey="quizzesPassed"
              stroke={COLORS.quizzesPassed}
              strokeWidth={2}
              dot={false}
              name="Quizzes Passed"
            />
            <Line
              type="monotone"
              dataKey="achievementUnlocks"
              stroke={COLORS.achievementUnlocks}
              strokeWidth={2}
              dot={false}
              name="Achievements"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
