"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EngagementAreaChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminChartSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAdminEngagementAnalytics } from "@/hooks/api/use-admin-analytics"

const DAY_OPTIONS = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" },
]

export default function AdminEngagementPage() {
  const [days, setDays] = useState("30")
  const { data, isLoading, error, refetch } = useAdminEngagementAnalytics(parseInt(days, 10))

  if (error) {
    return <AdminError message="Failed to load engagement data" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Tabs value={days}><TabsList>{DAY_OPTIONS.map((o) => <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>)}</TabsList></Tabs>
        <AdminChartSkeleton title="Active Users Over Time" />
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminTableSkeleton rows={5} />
          <AdminTableSkeleton rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={days} onValueChange={setDays}>
        <TabsList>
          {DAY_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value}>
              {opt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <EngagementAreaChart
        data={data?.activeUsersOverTime ?? []}
        title="Active Users Over Time"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {data?.popularVisualizations && data.popularVisualizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.popularVisualizations.map((item, i) => (
                    <TableRow key={item.topic}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>{item.topic}</TableCell>
                      <TableCell className="text-right">
                        {item.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {data?.sessionDistribution && data.sessionDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Session Frequency Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sessions</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessionDistribution.map((item) => (
                    <TableRow key={item.range}>
                      <TableCell>{item.range}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
