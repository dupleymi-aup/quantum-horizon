"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GradeDistributionBucket } from "@/hooks/api/use-admin-analytics"

interface GradeDistributionChartProps {
  data: GradeDistributionBucket[]
  title?: string
}

const BUCKET_COLORS: Record<string, string> = {
  "0-9": "#ef4444",
  "10-19": "#f97316",
  "20-29": "#f59e0b",
  "30-39": "#eab308",
  "40-49": "#a3e635",
  "50-59": "#84cc16",
  "60-69": "#22c55e",
  "70-79": "#14b8a6",
  "80-89": "#3b82f6",
  "90-99": "#6366f1",
  "100": "#8b5cf6",
}

export function GradeDistributionChart({
  data,
  title = "Grade Distribution",
}: GradeDistributionChartProps) {
  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No grade distribution data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis dataKey="range" tick={{ fontSize: 11 }} tickFormatter={(v: string) => `${v}%`} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.range] ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
