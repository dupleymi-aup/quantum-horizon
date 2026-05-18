"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminError } from "@/components/admin/admin-error"
import { useAdminLiveData, useAdminAlerts, useAdminReport } from "@/hooks/api/use-admin-features"
import {
  AlertTriangle,
  Bell,
  Check,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Award,
} from "lucide-react"

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

function LiveMonitor() {
  const { data, isLoading, error, refetch } = useAdminLiveData(15000)

  if (error) return <AdminError message="Failed to load live data" onRetry={() => void refetch()} />
  if (isLoading) return <p className="text-muted-foreground">Connecting to live feed...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          Live Monitor
        </h3>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active Now (1h)</p>
              <p className="text-2xl font-bold">{data?.currentlyActive ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Actions (5 min)</p>
              <p className="text-2xl font-bold">{data?.fiveMinCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Today's Users</p>
              <p className="text-2xl font-bold">{data?.todayStats.uniqueUsers ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Today's Actions</p>
              <p className="text-2xl font-bold">
                {data?.todayStats.byType.reduce((s, b) => s + b.count, 0) ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      {data?.recentActivities && data.recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {data.recentActivities.slice(0, 20).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium capitalize">{a.action.replace(/_/g, " ")}</span>
                  {a.topic && <span className="text-muted-foreground">→ {a.topic}</span>}
                  {a.userName && (
                    <span className="text-muted-foreground ml-auto">{a.userName}</span>
                  )}
                  <span className="text-muted-foreground text-xs">
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AlertsPanel() {
  const { data, isLoading, error, markRead } = useAdminAlerts(false)

  if (error) return <AdminError message="Failed to load alerts" />
  if (isLoading) return <p className="text-muted-foreground">Loading alerts...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="h-5 w-5" />
          Alerts
          {data?.unreadCount ? <Badge variant="destructive">{data.unreadCount}</Badge> : null}
        </h3>
        {data?.unreadCount ? (
          <Button variant="outline" size="sm" onClick={() => void markRead(undefined)}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Mark All Read
          </Button>
        ) : null}
      </div>

      {data?.alerts && data.alerts.length > 0 ? (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <Card
              key={alert.id}
              className={!alert.read ? "border-l-4" : "opacity-70"}
              style={
                !alert.read
                  ? {
                      borderLeftColor:
                        alert.severity === "critical"
                          ? "#ef4444"
                          : alert.severity === "warning"
                            ? "#f59e0b"
                            : "#3b82f6",
                    }
                  : {}
              }
            >
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    alert.severity === "critical"
                      ? "text-red-600"
                      : alert.severity === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}>
                      {alert.severity}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{alert.message}</p>
                </div>
                {!alert.read && (
                  <Button variant="ghost" size="sm" onClick={() => void markRead(alert.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center">No alerts</CardContent>
        </Card>
      )}
    </div>
  )
}

function ReportsPanel() {
  const [range, setRange] = useState("30d")
  const { data, isLoading, error, refetch } = useAdminReport(range)

  if (error) return <AdminError message="Failed to load report" onRetry={() => void refetch()} />
  if (isLoading) return <p className="text-muted-foreground">Generating report...</p>

  const handleExportText = () => {
    if (!data) return
    const lines = [
      `Report: ${data.period.days.toString()} days (${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()})`,
      "",
      "Summary:",
      `  New Users: ${data.summary.newUsers.toString()}`,
      `  Total Activities: ${data.summary.totalActivities.toLocaleString()}`,
      `  Achievement Unlocks: ${data.summary.achievementUnlocks.toLocaleString()}`,
      `  Avg Session Duration: ${Math.round(data.summary.avgSessionDuration / 60).toString()}m`,
      `  Activity Trend: ${data.summary.activityTrend > 0 ? "+" : ""}${data.summary.activityTrend.toString()}%`,
      "",
      "Activity Breakdown:",
      ...data.activityBreakdown.map((a) => `  ${a.action}: ${a.count.toLocaleString()}`),
      "",
      "Top Topics:",
      ...data.topTopics.map(
        (t) =>
          `  ${t.topic}: ${t.completions.toLocaleString()} completions (${t.users.toString()} users)`
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report_${range}_${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Reports
        </h3>
        <Button variant="outline" size="sm" onClick={handleExportText}>
          Export
        </Button>
      </div>

      <Tabs value={range} onValueChange={setRange}>
        <TabsList>
          <TabsTrigger value="7d">7 Days</TabsTrigger>
          <TabsTrigger value="30d">30 Days</TabsTrigger>
          <TabsTrigger value="90d">90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">New Users</p>
                <p className="text-2xl font-bold">{data.summary.newUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">Total Activities</p>
                <p className="text-2xl font-bold">
                  {data.summary.totalActivities.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">Activity Trend</p>
                <p
                  className={`text-2xl font-bold ${data.summary.activityTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {data.summary.activityTrend > 0 ? "+" : ""}
                  {data.summary.activityTrend}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {data.activityBreakdown.map((a) => (
                  <div key={a.action} className="flex justify-between border-b py-2 last:border-0">
                    <span className="capitalize">{a.action.replace(/_/g, " ")}</span>
                    <span className="font-medium">{a.count.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topTopics.map((t, i) => (
                  <div key={t.topic} className="flex justify-between border-b py-2 last:border-0">
                    <span>
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {t.topic}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {t.completions} ({t.users} users)
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminInsightsPage() {
  const [tab, setTab] = useState("live")

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="live">Live Monitor</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "live" && <LiveMonitor />}
      {tab === "alerts" && <AlertsPanel />}
      {tab === "reports" && <ReportsPanel />}
    </div>
  )
}
