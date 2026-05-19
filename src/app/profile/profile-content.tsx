"use client"

import { User, Award, BookOpen, Clock, Trophy, Star, Mail, Calendar, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserDashboard } from "@/hooks/api/use-user-dashboard"
import type { Session } from "next-auth"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function getRoleBadge(role?: string) {
  switch (role) {
    case "ADMIN":
      return "bg-red-500/20 text-red-500"
    case "MODERATOR":
      return "bg-blue-500/20 text-blue-500"
    default:
      return "bg-green-500/20 text-green-500"
  }
}

function getActivityIcon(action: string) {
  if (action.includes("lesson")) return <BookOpen className="size-4 text-green-500" />
  if (action.includes("quiz")) return <Award className="size-4 text-blue-500" />
  if (action.includes("achievement")) return <Trophy className="size-4 text-yellow-500" />
  if (action.includes("visualization")) return <Star className="size-4 text-cyan-500" />
  if (action.includes("session")) return <Clock className="size-4 text-purple-500" />
  return <Star className="size-4 text-gray-500" />
}

function getActionLabel(action: string) {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

interface ProfileContentProps {
  session: Session
}

export function ProfileContent({ session }: ProfileContentProps) {
  const { dashboard, loading } = useUserDashboard()

  const user = session.user
  const userName = user.name ?? "Explorer"
  const userEmail = user.email ?? ""
  const userRole = (user as { role?: string }).role ?? "USER"
  const createdAt = (user as { createdAt?: string }).createdAt

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
        <div className="border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6">
          <div className="flex items-center gap-6">
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-5">
              <User className="size-10 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{userName}</h2>
                <span className={cn("rounded-full px-3 py-0.5 text-xs font-medium", getRoleBadge(userRole))}>
                  {userRole}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail className="size-4" />
                  {userEmail}
                </span>
                {createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    Joined {formatDate(createdAt)}
                  </span>
                )}
              </div>
              {dashboard && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-purple-500">
                    <Trophy className="size-4" />
                    <span>Level {dashboard.stats.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Shield className="size-4" />
                    <span>{dashboard.stats.achievementsUnlocked} achievements</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading achievements...</div>
        </div>
      ) : dashboard ? (
        <>
          {/* Achievement Gallery */}
          <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
            <div className="flex items-center gap-2 border-b p-4">
              <Trophy className="size-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Achievement Gallery</h3>
              <span className="text-muted-foreground ml-auto text-sm">
                {dashboard.stats.achievementsUnlocked} unlocked
                {dashboard.stats.achievementsInProgress > 0 && (
                  <span> · {dashboard.stats.achievementsInProgress} in progress</span>
                )}
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.achievements.length > 0 ? (
                dashboard.achievements.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-lg border p-4 transition-all",
                      a.unlocked
                        ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent"
                        : "border-gray-200 opacity-60 dark:border-gray-700"
                    )}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-full bg-yellow-500/20 p-2.5 text-xl">
                        {a.unlocked ? "🏆" : "🔒"}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {a.achievementId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {a.unlocked ? `Unlocked ${formatDate(a.unlockedAt)}` : "Locked"}
                        </div>
                      </div>
                    </div>
                    {!a.unlocked && a.target > 1 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-muted-foreground">
                            {a.progress}/{a.target}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-yellow-500 transition-all"
                            style={{ width: `${String(Math.round((a.progress / a.target) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground col-span-full py-8 text-center">
                  <Trophy className="mx-auto mb-3 size-12 opacity-30" />
                  <p>No achievements yet. Keep exploring!</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
            <div className="flex items-center gap-2 border-b p-4">
              <Clock className="size-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Activity Feed</h3>
            </div>
            <div className="divide-y">
              {dashboard.recentActivity.length > 0 ? (
                dashboard.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-background rounded-full p-2">
                        {getActivityIcon(act.action)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{getActionLabel(act.action)}</div>
                        <div className="text-muted-foreground text-xs">
                          {act.topic && (
                            <span>
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
                <div className="text-muted-foreground p-8 text-center text-sm">
                  No activity yet. Start exploring!
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border shadow-lg">
          <div className="p-8 text-center text-gray-500">
            <p>Sign in and start exploring to see your achievements and activity!</p>
          </div>
        </div>
      )}
    </div>
  )
}
