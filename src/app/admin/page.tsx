"use client"

import { Users, Activity, Clock, Award } from "lucide-react"
import { StatCard, ActivityLineChart, ProgressBarChart } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin/admin-skeleton"
import {
  useAdminOverview,
  useAdminActivityAnalytics,
  useAdminProgressAnalytics,
} from "@/hooks/api/use-admin-analytics"

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
}

export default function AdminOverviewPage() {
  const overview = useAdminOverview()
  const activity = useAdminActivityAnalytics("30d")
  const progress = useAdminProgressAnalytics()

  const isLoading = overview.isLoading || activity.isLoading || progress.isLoading
  const hasError = overview.error || activity.error || progress.error

  if (hasError) {
    return (
      <AdminError
        message="Failed to load dashboard data"
        onRetry={() => {
          overview.refetch()
          activity.refetch()
          progress.refetch()
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminStatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminChartSkeleton title="Activity (Last 30 Days)" />
          <AdminChartSkeleton title="Topic Completion Rates" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={overview.data?.totalUsers ?? 0}
        />
        <StatCard
          icon={Activity}
          label="Active (7 days)"
          value={overview.data?.activeUsers7d ?? 0}
        />
        <StatCard
          icon={Clock}
          label="Avg Session"
          value={overview.data ? formatDuration(overview.data.avgSessionDuration) : "0s"}
        />
        <StatCard
          icon={Award}
          label="Total Activities"
          value={overview.data?.totalActivities ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityLineChart
          data={activity.data?.dailyData ?? []}
          title="Activity (Last 30 Days)"
        />
        <ProgressBarChart
          data={progress.data?.topicStats ?? []}
          title="Topic Completion Rates"
        />
      </div>

      {overview.data?.activitiesByType && overview.data.activitiesByType.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Activity Breakdown</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.data.activitiesByType.map((item) => (
              <div
                key={item.action}
                className="rounded-lg border bg-card p-4"
              >
                <p className="text-sm text-muted-foreground capitalize">
                  {item.action.replace(/_/g, " ")}
                </p>
                <p className="text-xl font-bold">{item.count.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
