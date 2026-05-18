"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ActivityLineChart } from "@/components/analytics"
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
import { useAdminActivityAnalytics } from "@/hooks/api/use-admin-analytics"

const PERIODS = ["7d", "30d", "90d"]

export default function AdminActivityPage() {
  const [period, setPeriod] = useState("30d")
  const { data, isLoading, error, refetch } = useAdminActivityAnalytics(period)

  if (error) {
    return <AdminError message="Failed to load activity data" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Tabs value={period}><TabsList>{PERIODS.map((p) => <TabsTrigger key={p} value={p}>{p}</TabsTrigger>)}</TabsList></Tabs>
        <AdminChartSkeleton title="Activity Over Time" />
        <AdminTableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          {PERIODS.map((p) => (
            <TabsTrigger key={p} value={p}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ActivityLineChart
        data={data?.dailyData ?? []}
        title={`Activity — Last ${period}`}
      />

      {data?.topicBreakdown && data.topicBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topicBreakdown
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <TableRow key={item.topic}>
                      <TableCell className="font-medium">{item.topic}</TableCell>
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
    </div>
  )
}
