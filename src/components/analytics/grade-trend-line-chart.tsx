"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GradeTrendPoint } from "@/hooks/api/use-admin-analytics"

interface GradeTrendLineChartProps {
  data: GradeTrendPoint[]
  title?: string
}

export function GradeTrendLineChart({
  data,
  title = "Grade Trends Over Time",
}: GradeTrendLineChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">No grade data available</p>
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
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => `${String(v)}%`}
            />
            <Tooltip formatter={(value) => `${String(value)}%`} />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label="60%" />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Avg Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
