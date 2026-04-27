"use client"

import { User, Award, BookOpen, Clock, TrendingUp, Star, Trophy, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserProgress } from "@/hooks/api/use-user-progress"
import { useAchievements } from "@/hooks/api/use-achievements"
import { useActivity } from "@/hooks/api/use-activity"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface CourseProgress {
  courseId: string
  courseName: string
  progress: number
  lastAccessed: Date
  nextLesson: string
}

interface ActivityItem {
  id: string
  type:
    | "lesson_completed"
    | "quiz_passed"
    | "achievement_unlocked"
    | "study_session"
    | "visualization_viewed"
  description: string
  timestamp: Date
  xpEarned: number
}

interface UserProgressData {
  userId: string
  username: string
  level: number
  xp: number
  xpToNextLevel: number
  coursesCompleted: number
  totalStudyTime: number
  streak: number
  achievements: Achievement[]
  currentCourses: CourseProgress[]
  recentActivity: ActivityItem[]
}

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const { stats, progress, loading: progressLoading } = useUserProgress()
  const { achievements: apiAchievements, loading: achievementsLoading } = useAchievements()
  const { activities: apiActivities, loading: activitiesLoading } = useActivity()

  const _loading = progressLoading || achievementsLoading || activitiesLoading

  // Fallback mock data for non-authenticated users
  const mockUserProgress: UserProgressData = {
    userId: "user_001",
    username: "SpaceExplorer",
    level: 12,
    xp: 3450,
    xpToNextLevel: 5000,
    coursesCompleted: 8,
    totalStudyTime: 1240,
    streak: 15,
    achievements: [
      {
        id: "ach_001",
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "🌟",
        unlockedAt: new Date("2026-03-01"),
        rarity: "common",
      },
      {
        id: "ach_002",
        name: "Stargazer",
        description: "Observe 10 celestial objects",
        icon: "🔭",
        unlockedAt: new Date("2026-03-05"),
        rarity: "rare",
      },
      {
        id: "ach_003",
        name: "Quantum Master",
        description: "Complete all quantum mechanics courses",
        icon: "⚛️",
        unlockedAt: new Date("2026-03-10"),
        rarity: "epic",
      },
      {
        id: "ach_004",
        name: "Cosmic Explorer",
        description: "Visit all sections of the platform",
        icon: "🌌",
        unlockedAt: new Date("2026-03-15"),
        rarity: "legendary",
      },
    ],
    currentCourses: [
      {
        courseId: "course_001",
        courseName: "Introduction to Astrophysics",
        progress: 75,
        lastAccessed: new Date("2026-03-18T10:30:00Z"),
        nextLesson: "Stellar Evolution",
      },
      {
        courseId: "course_002",
        courseName: "Quantum Mechanics Fundamentals",
        progress: 45,
        lastAccessed: new Date("2026-03-17T14:20:00Z"),
        nextLesson: "Wave Functions",
      },
      {
        courseId: "course_003",
        courseName: "General Relativity",
        progress: 20,
        lastAccessed: new Date("2026-03-16T09:15:00Z"),
        nextLesson: "Spacetime Curvature",
      },
    ],
    recentActivity: [
      {
        id: "act_001",
        type: "lesson_completed",
        description: "Completed 'Black Holes Basics'",
        timestamp: new Date("2026-03-18T11:45:00Z"),
        xpEarned: 100,
      },
      {
        id: "act_002",
        type: "quiz_passed",
        description: "Passed quiz on Thermodynamics (95%)",
        timestamp: new Date("2026-03-18T10:30:00Z"),
        xpEarned: 150,
      },
      {
        id: "act_003",
        type: "achievement_unlocked",
        description: "Unlocked 'Cosmic Explorer' achievement",
        timestamp: new Date("2026-03-17T16:20:00Z"),
        xpEarned: 500,
      },
      {
        id: "act_004",
        type: "study_session",
        description: "2 hour study session",
        timestamp: new Date("2026-03-17T14:00:00Z"),
        xpEarned: 120,
      },
    ],
  }

  // Map API achievements to component format
  const mappedAchievements: Achievement[] =
    apiAchievements.length > 0
      ? apiAchievements
          .filter((a) => a.progress >= a.target)
          .map((a) => ({
            id: a.id,
            name: a.achievementId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            description: `Achievement: ${a.achievementId}`,
            icon: "🏆",
            unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : new Date(),
            rarity:
              a.target >= 10
                ? "legendary"
                : a.target >= 5
                  ? "epic"
                  : a.target >= 2
                    ? "rare"
                    : "common",
          }))
      : mockUserProgress.achievements

  // Map API activities to component format
  const mappedActivities: ActivityItem[] =
    apiActivities.length > 0
      ? apiActivities.slice(0, 10).map((a) => ({
          id: a.id,
          type: a.action.includes("quiz")
            ? "quiz_passed"
            : a.action.includes("achievement")
              ? "achievement_unlocked"
              : a.action.includes("lesson")
                ? "lesson_completed"
                : a.action.includes("visualization")
                  ? "visualization_viewed"
                  : "study_session",
          description: a.action,
          timestamp: new Date(a.createdAt),
          xpEarned: a.xpGained,
        }))
      : mockUserProgress.recentActivity

  // Map progress data to courses
  const mappedCourses: CourseProgress[] =
    progress.length > 0
      ? progress.slice(0, 5).map((p) => ({
          courseId: p.id,
          courseName: p.topic.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          progress: Math.min(p.completedCount * 20, 100),
          lastAccessed: new Date(p.lastCompleted),
          nextLesson: "Continue exploring",
        }))
      : mockUserProgress.currentCourses

  // Build user progress from API data or fallback to mock
  const userProgress: UserProgressData = stats
    ? {
        userId: "user_001",
        username: "SpaceExplorer",
        level: stats.level,
        xp: stats.totalXP,
        xpToNextLevel: stats.level * 500,
        coursesCompleted: stats.completedCourses,
        totalStudyTime: stats.totalTimeSpent,
        streak: stats.currentStreak,
        achievements: mappedAchievements,
        currentCourses: mappedCourses,
        recentActivity: mappedActivities,
      }
    : { ...mockUserProgress, achievements: mappedAchievements, recentActivity: mappedActivities }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400 bg-gray-400/10"
      case "rare":
        return "text-blue-500 border-blue-500 bg-blue-500/10"
      case "epic":
        return "text-purple-500 border-purple-500 bg-purple-500/10"
      case "legendary":
        return "text-yellow-500 border-yellow-500 bg-yellow-500/10"
      default:
        return "text-gray-400 border-gray-400 bg-gray-400/10"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return <BookOpen className="size-4 text-green-500" />
      case "quiz_passed":
        return <Award className="size-4 text-blue-500" />
      case "achievement_unlocked":
        return <Trophy className="size-4 text-yellow-500" />
      case "visualization_viewed":
        return <Star className="size-4 text-cyan-500" />
      case "study_session":
        return <Clock className="size-4 text-purple-500" />
      default:
        return <Star className="size-4 text-gray-500" />
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString()}h ${mins.toString()}m`
  }

  return (
    <div className={cn("bg-card overflow-hidden rounded-xl border shadow-lg", className)}>
      {/* Header - Profile Summary */}
      <div className="border-b bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-4">
              <User className="size-8 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{userProgress.username}</h3>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-500">
                  Level {userProgress.level}
                </span>
              </div>
              {/* XP Progress Bar */}
              <div className="w-[300px] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-medium">
                    {userProgress.xp} / {userProgress.xpToNextLevel}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{
                      width: `${((userProgress.xp / userProgress.xpToNextLevel) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1 text-orange-500">
                  <TrendingUp className="size-4" />
                  <span>{userProgress.streak} day streak 🔥</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <Award className="size-4" />
                  <span>{userProgress.achievements.length} achievements</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-purple-500">
                {userProgress.coursesCompleted}
              </div>
              <div className="text-muted-foreground text-xs">Courses Done</div>
            </div>
            <div className="bg-background rounded-lg border p-3 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {formatTime(userProgress.totalStudyTime)}
              </div>
              <div className="text-muted-foreground text-xs">Study Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Current Courses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-purple-500" />
            <h4 className="text-lg font-semibold">Current Courses</h4>
          </div>
          <div className="space-y-3">
            {userProgress.currentCourses.map((course) => (
              <div key={course.courseId} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="font-medium">{course.courseName}</h5>
                    <div className="text-muted-foreground text-xs">Next: {course.nextLesson}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-500">{course.progress}%</div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${course.progress.toFixed(1)}%` }}
                  />
                </div>
              </div>
            ))}
            {userProgress.currentCourses.length === 0 && (
              <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                No courses in progress yet. Start exploring visualizations!
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-yellow-500" />
            <h4 className="text-lg font-semibold">Achievements</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {userProgress.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  getRarityColor(achievement.rarity)
                )}
              >
                <div className="mb-2 text-2xl">{achievement.icon}</div>
                <div className="text-sm font-semibold">{achievement.name}</div>
                <div className="text-xs opacity-70">{achievement.description}</div>
                <div className="mt-2 text-xs opacity-50">
                  {achievement.unlockedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          {userProgress.achievements.length === 0 && (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              No achievements unlocked yet. Keep exploring!
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-muted/50 border-t p-6">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-blue-500" />
          <h4 className="text-lg font-semibold">Recent Activity</h4>
        </div>
        <div className="mt-4 space-y-3">
          {userProgress.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-background rounded-full p-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-muted-foreground text-xs">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-500">
                +{activity.xpEarned} XP
              </div>
            </div>
          ))}
          {userProgress.recentActivity.length === 0 && (
            <div className="text-muted-foreground text-center text-sm">
              No recent activity. Start exploring to track your progress!
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="border-t bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">{userProgress.level}</div>
            <div className="text-muted-foreground text-xs">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{userProgress.coursesCompleted}</div>
            <div className="text-muted-foreground text-xs">Courses Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-500">
              {formatTime(userProgress.totalStudyTime)}
            </div>
            <div className="text-muted-foreground text-xs">Total Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{userProgress.streak}</div>
            <div className="text-muted-foreground text-xs">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
