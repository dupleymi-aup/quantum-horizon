"use client"

import { useState } from "react"
import { User, Award, BookOpen, Clock, TrendingUp, Star, Trophy, Target, BarChart3, GraduationCap, Zap, Flame, Bell, Trash2, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserDashboard } from "@/hooks/api/use-user-dashboard"
import { useReminders } from "@/hooks/api/use-reminders"
import { ReminderDialog } from "@/components/reminders/reminder-dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/use-i18n"

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString()}h ${mins.toString()}m`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function getActivityIcon(action: string) {
  if (action.includes("lesson")) return <BookOpen className="size-4 text-green-500" />
  if (action.includes("quiz")) return <Award className="size-4 text-blue-500" />
  if (action.includes("achievement")) return <Trophy className="size-4 text-yellow-500" />
  if (action.includes("visualization")) return <Star className="size-4 text-cyan-500" />
  if (action.includes("session")) return <Clock className="size-4 text-purple-500" />
  return <Zap className="size-4 text-gray-500" />
}

function getActionLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getMasteryColor(score: number) {
  if (score >= 85) return "text-green-500"
  if (score >= 70) return "text-blue-500"
  if (score >= 50) return "text-yellow-500"
  return "text-red-500"
}

function getMasteryBg(score: number) {
  if (score >= 85) return "bg-green-500/10 border-green-500/30"
  if (score >= 70) return "bg-blue-500/10 border-blue-500/30"
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500/30"
  return "bg-red-500/10 border-red-500/30"
}

interface DashboardContentProps {
  userName: string
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const { dashboard, loading } = useUserDashboard()
  const t = useI18n()

  // Reminders
  const { reminders, isLoading: remindersLoading, createReminder, deleteReminder, isCreating, isDeleting } = useReminders()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateReminder = async (data: {
    title: string
    description?: string
    topic?: string
    deadline: string
    type: "PERSONAL" | "STUDY" | "EXAM"
  }) => {
    await createReminder(data)
  }

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id)
  }

  const formatDeadlineDate = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 0) return t("reminders.overdue")
    if (diffHours === 0) return `${Math.floor(diffMs / (1000 * 60))} min left`
    if (diffHours < 24) return `${diffHours}h left`
    if (diffDays === 1) return t("reminders.dueToday")
    return `${diffDays}d left`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "EXAM": return "bg-red-500/20 text-red-500"
      case "STUDY": return "bg-blue-500/20 text-blue-500"
      default: return "bg-gray-500/20 text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="p-12 text-center">
          <BarChart3 className="text-muted-foreground mx-auto mb-4 size-16" />
          <h2 className="mb-2 text-xl font-semibold">No Data Yet</h2>
          <p className="text-muted-foreground">
            Start exploring visualizations and lessons to see your progress here!
          </p>
        </div>
      </div>
    )
  }

  const { stats, progress, achievements, recentActivity, xpTrend, topicGrades } = dashboard
  const xpPercent = Math.min((stats.totalXP / stats.xpToNextLevel) * 100, 100)
  const maxXpInTrend = Math.max(...xpTrend.map((p) => p.xp), 1)

  return (
    <div className="space-y-6">
      {/* Header - Quick Stats */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-4">
                <User className="size-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{userName}</h2>
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-500">
                    Level {stats.level}
                  </span>
                </div>
                <div className="mt-2 w-[300px] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium">
                      {stats.totalXP} / {stats.xpToNextLevel}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${xpPercent.toFixed(1)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4 text-center transition-colors hover:border-purple-500/50">
            <div className="text-3xl font-bold text-purple-500">{stats.completedTopics}</div>
            <div className="text-muted-foreground mt-1 text-xs">Topics Completed</div>
          </div>
          <div className="rounded-lg border p-4 text-center transition-colors hover:border-blue-500/50">
            <div className="text-3xl font-bold text-blue-500">{formatTime(stats.totalStudyMinutes)}</div>
            <div className="text-muted-foreground mt-1 text-xs">Total Study Time</div>
          </div>
          <div className="rounded-lg border p-4 text-center transition-colors hover:border-cyan-500/50">
            <div className="text-3xl font-bold text-cyan-500">{stats.totalSessions}</div>
            <div className="text-muted-foreground mt-1 text-xs">Study Sessions</div>
          </div>
          <div className="rounded-lg border p-4 text-center transition-colors hover:border-orange-500/50">
            <div className="text-3xl font-bold text-orange-500">{stats.achievementsUnlocked}</div>
            <div className="text-muted-foreground mt-1 text-xs">Achievements</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* XP Trend */}
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <div className="flex items-center gap-2 border-b p-4">
            <TrendingUp className="size-5 text-green-500" />
            <h3 className="text-lg font-semibold">XP Trend (7 Days)</h3>
          </div>
          <div className="p-4">
            {xpTrend.length > 0 ? (
              <div className="flex items-end gap-2" style={{ height: 120 }}>
                {xpTrend.map((point) => {
                  const height = maxXpInTrend > 0 ? (point.xp / maxXpInTrend) * 100 : 0
                  return (
                    <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium">{point.xp}</span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-purple-500 to-blue-500 transition-all"
                        style={{ height: `${String(Math.max(height, 4))}%`, minHeight: 4 }}
                      />
                      <span className="text-muted-foreground text-xs">
                        {new Date(point.date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No XP earned this week yet
              </div>
            )}
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <div className="flex items-center gap-2 border-b p-4">
            <Flame className="size-5 text-orange-500" />
            <h3 className="text-lg font-semibold">This Week</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="rounded-lg bg-purple-500/10 p-4 text-center">
              <Zap className="mx-auto mb-1 size-6 text-purple-500" />
              <div className="text-xl font-bold text-purple-500">{stats.totalXP}</div>
              <div className="text-muted-foreground text-xs">Total XP</div>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-4 text-center">
              <Clock className="mx-auto mb-1 size-6 text-blue-500" />
              <div className="text-xl font-bold text-blue-500">{stats.weeklySessions}</div>
              <div className="text-muted-foreground text-xs">Sessions</div>
            </div>
            <div className="rounded-lg bg-cyan-500/10 p-4 text-center">
              <Target className="mx-auto mb-1 size-6 text-cyan-500" />
              <div className="text-xl font-bold text-cyan-500">{progress.length}</div>
              <div className="text-muted-foreground text-xs">Topics Active</div>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-4 text-center">
              <GraduationCap className="mx-auto mb-1 size-6 text-orange-500" />
              <div className="text-xl font-bold text-orange-500">{stats.assessmentsTaken}</div>
              <div className="text-muted-foreground text-xs">Assessments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topic Progress */}
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <div className="flex items-center gap-2 border-b p-4">
            <Target className="size-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Topic Progress</h3>
          </div>
          <div className="space-y-3 p-4">
            {progress.length > 0 ? (
              progress.slice(0, 8).map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {p.topic.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className="text-muted-foreground">{p.completedCount}x</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${String(Math.min(p.completedCount * 20, 100))}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Last: {formatDate(p.lastCompleted)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No topics started yet
              </div>
            )}
          </div>
        </div>

        {/* Grade Summary */}
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <div className="flex items-center gap-2 border-b p-4">
            <GraduationCap className="size-5 text-green-500" />
            <h3 className="text-lg font-semibold">Grade Summary</h3>
            {stats.overallGradeAvg !== null && (
              <span className={cn("ml-auto text-lg font-bold", getMasteryColor(stats.overallGradeAvg))}>
                {stats.overallGradeAvg}%
              </span>
            )}
          </div>
          <div className="space-y-3 p-4">
            {topicGrades.length > 0 ? (
              topicGrades.map((tg) => (
                <div
                  key={tg.topic}
                  className={cn("rounded-lg border p-3", getMasteryBg(tg.avgScore))}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {tg.topic.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className={cn("text-lg font-bold", getMasteryColor(tg.avgScore))}>
                      {tg.avgScore}%
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {tg.assessmentsTaken} assessment{tg.assessmentsTaken !== 1 ? "s" : ""}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${String(tg.avgScore)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No assessments completed yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="flex items-center gap-2 border-b p-4">
          <Clock className="size-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-2 p-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-background rounded-full p-2">
                    {getActivityIcon(act.action)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{getActionLabel(act.action)}</div>
                    <div className="text-muted-foreground text-xs">
                      {act.topic && (
                        <span className="mr-2">
                          {act.topic.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          <span className="mx-1">·</span>
                        </span>
                      )}
                      {formatDateTime(act.createdAt)}
                    </div>
                  </div>
                </div>
                {act.xpGained > 0 && (
                  <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-500">
                    +{act.xpGained} XP
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-6 text-center text-sm">
              No recent activity. Start exploring!
            </div>
          )}
        </div>
      </div>

      {/* Achievement Preview */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="flex items-center gap-2 border-b p-4">
          <Trophy className="size-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Achievements</h3>
          <span className="text-muted-foreground ml-auto text-sm">
            {stats.achievementsUnlocked} unlocked
            {stats.achievementsInProgress > 0 && ` · ${String(stats.achievementsInProgress)} in progress`}
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.length > 0 ? (
            achievements.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  a.unlocked
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="mb-2 text-2xl">
                  {a.unlocked ? "🏆" : "🔒"}
                </div>
                <div className="text-sm font-semibold">
                  {a.achievementId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {a.unlocked
                    ? `Unlocked ${formatDate(a.unlockedAt)}`
                    : `Progress: ${String(a.progress)}/${String(a.target)}`}
                </div>
                {!a.unlocked && a.target > 1 && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-yellow-500"
                      style={{ width: `${String(Math.round((a.progress / a.target) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground col-span-full py-6 text-center text-sm">
              No achievements yet
            </div>
          )}
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">{t("reminders.title")}</h3>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <CalendarClock className="mr-1 size-4" />
            {t("reminders.createReminder")}
          </Button>
        </div>
        <div className="space-y-2 p-4">
          {remindersLoading ? (
            <div className="text-muted-foreground py-6 text-center text-sm">Loading...</div>
          ) : reminders.length > 0 ? (
            reminders.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium", getTypeColor(r.type))}>
                    {t(`reminders.type.${r.type}` as Parameters<typeof t>[0])}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    {r.description && (
                      <div className="text-muted-foreground text-xs">{r.description}</div>
                    )}
                    <div className="text-muted-foreground text-xs">
                      {r.topic && <span className="mr-1">{r.topic} ·</span>}
                      {formatDeadlineDate(r.deadline)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDeleteReminder(r.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {t("reminders.noReminders")}
            </div>
          )}
        </div>
      </div>

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateReminder}
        isSubmitting={isCreating}
      />
    </div>
  )
}
