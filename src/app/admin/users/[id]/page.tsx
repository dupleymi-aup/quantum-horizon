"use client"

import { useParams, useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminError } from "@/components/admin/admin-error"
import {
  AdminStatCardSkeleton,
  AdminChartSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-skeleton"
import { ArrowLeft, Award, BookOpen, Clock, Star, Target } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

interface UserDetail {
  user: {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
    createdAt: string
    updatedAt: string
  }
  totalXp: number
  totalActivities: number
  activityByType: Array<{ action: string; count: number }>
  activities: Array<{
    id: string
    action: string
    topic: string | null
    xpGained: number
    createdAt: string
  }>
  progress: Array<{
    id: string
    topic: string
    completedCount: number
    lastCompleted: string
  }>
  bookmarks: Array<{
    id: string
    topic: string
    title: string
    createdAt: string
  }>
  achievements: Array<{
    id: string
    achievementId: string
    progress: number
    target: number
    unlockedAt: string
  }>
  sessions: Array<{
    id: string
    startedAt: string
    endedAt: string | null
    durationSec: number
    topic: string | null
  }>
  xpOverTime: Array<{ date: string; xp: number; action: string }>
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${String(seconds)}s`
  if (seconds < 3600) return `${String(Math.round(seconds / 60))}m`
  return `${String(Math.round(seconds / 3600))}h ${String(Math.round((seconds % 3600) / 60))}m`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const { data, isLoading, error, refetch } = useQuery<UserDetail>({
    queryKey: ["adminUserDetail", userId],
    queryFn: async () => {
      const res = await fetchWithTimeout(`/api/admin/user/${userId}`, {
        timeoutMs: 15000,
      })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
      const json = (await res.json()) as { data: UserDetail }
      return json.data
    },
    staleTime: 2 * 60 * 1000,
  })

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.back()
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <AdminError message="Failed to load student details" onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-muted h-9 w-32 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminStatCardSkeleton key={i} />
          ))}
        </div>
        <AdminChartSkeleton title="XP Progress Over Time" />
        <AdminTableSkeleton rows={10} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Student not found</p>
        <Button
          variant="link"
          onClick={() => {
            router.back()
          }}
          className="mt-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    )
  }

  const {
    user,
    totalXp,
    totalActivities,
    activityByType,
    activities,
    progress,
    bookmarks,
    achievements,
    sessions,
    xpOverTime,
  } = data

  const totalSessionTime = sessions.reduce((sum, s) => sum + s.durationSec, 0)

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          router.back()
        }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      {/* User Header */}
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{user.name ?? "Unnamed"}</h2>
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "destructive"
                    : user.role === "MODERATOR"
                      ? "default"
                      : "secondary"
                }
              >
                {user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-muted-foreground text-sm">Registered {formatDate(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Star className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total XP</p>
              <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Target className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Activities</p>
              <p className="text-2xl font-bold">{totalActivities}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Clock className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Session Time</p>
              <p className="text-2xl font-bold">{formatDuration(totalSessionTime)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Award className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Achievements</p>
              <p className="text-2xl font-bold">{achievements.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XP Over Time */}
      {xpOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>XP Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={xpOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="XP"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Breakdown */}
        {activityByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activityByType
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div
                      key={item.action}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-sm capitalize">{item.action.replace(/_/g, " ")}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topic Progress */}
        {progress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {progress.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{p.topic}</span>
                      <span className="text-muted-foreground text-sm">
                        {p.completedCount} completions
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Last: {formatDate(p.lastCompleted)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bookmarks ({bookmarks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((b) => (
                <Badge key={b.id} variant="outline">
                  {b.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.slice(0, 20).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="capitalize">{a.action.replace(/_/g, " ")}</TableCell>
                  <TableCell>{a.topic ?? "—"}</TableCell>
                  <TableCell className="text-right">+{a.xpGained}</TableCell>
                  <TableCell>{formatDate(a.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
