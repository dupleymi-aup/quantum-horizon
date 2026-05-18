"use client"

import { RankingTable, PerformanceDistribution } from "@/components/analytics"
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
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useAdminPerformanceAnalytics } from "@/hooks/api/use-admin-analytics"

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export default function AdminPerformancePage() {
  const { data, isLoading, error, refetch } = useAdminPerformanceAnalytics()

  const handleExportCSV = () => {
    if (!data?.rankings?.length) return

    const headers = ["Rank", "Name", "Email", "Total XP", "Activities", "Last Active"]
    const rows = data.rankings.map((r, i) => [
      String(i + 1),
      escapeCSV(r.name || "Unknown"),
      escapeCSV(r.email || ""),
      String(r.totalXp),
      String(r.activityCount),
      escapeCSV(r.lastActive ? new Date(r.lastActive).toLocaleDateString() : "Never"),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_rankings.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return <AdminError message="Failed to load performance data" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="h-9 w-28 rounded bg-muted" />
        </div>
        <AdminTableSkeleton rows={10} />
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminChartSkeleton title="XP Distribution" />
          <AdminTableSkeleton rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <RankingTable data={data?.rankings ?? []} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceDistribution data={data?.xpDistribution ?? []} />

        {data?.cohortComparison && data.cohortComparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cohort Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Avg XP</TableHead>
                    <TableHead className="text-right">Avg Activities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.cohortComparison.map((c) => (
                    <TableRow key={c.cohort}>
                      <TableCell className="font-medium">{c.cohort}</TableCell>
                      <TableCell className="text-right">{c.users}</TableCell>
                      <TableCell className="text-right">{c.avgXp.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{c.avgActivities}</TableCell>
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
