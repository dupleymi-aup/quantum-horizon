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
import type { XpBucket } from "@/hooks/api/use-admin-analytics"

const BUCKET_COLORS = ["#94a3b8", "#3b82f6", "#22c55e", "#a855f7", "#f59e0b"]

interface PerformanceDistributionProps {
  data: XpBucket[]
  title?: string
}

export function PerformanceDistribution({ data, title = "XP Distribution" }: PerformanceDistributionProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">No distribution data available</p>
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
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${String(index)}`} fill={BUCKET_COLORS[index % BUCKET_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
