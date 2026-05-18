"use client"

import { ProgressBarChart } from "@/components/analytics"
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
import { useAdminProgressAnalytics } from "@/hooks/api/use-admin-analytics"

function formatShortDate(iso: string | null): string {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString()
}

export default function AdminProgressPage() {
  const { data, isLoading, error, refetch } = useAdminProgressAnalytics()

  if (error) {
    return <AdminError message="Failed to load progress data" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminChartSkeleton title="Completion Rate by Topic" />
        <AdminTableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProgressBarChart
        data={data?.topicStats ?? []}
        title="Completion Rate by Topic"
      />

      {data?.topicStats && data.topicStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                  <TableHead className="text-right">Avg Progress</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Bookmarks</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topicStats.map((item) => (
                  <TableRow key={item.topic}>
                    <TableCell className="font-medium">{item.topic}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          item.completionRate >= 70
                            ? "text-green-600"
                            : item.completionRate >= 30
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {item.completionRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.avgProgress}</TableCell>
                    <TableCell className="text-right">{item.totalUsers}</TableCell>
                    <TableCell className="text-right">{item.bookmarkCount}</TableCell>
                    <TableCell>{formatShortDate(item.lastActivity)}</TableCell>
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
