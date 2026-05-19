"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Activity, BookOpen, Users, Trophy, UserCircle, Columns, Bell, FileText, FolderOpen, TrendingUp, UserCheck, Download, CalendarClock } from "lucide-react"

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/progress", label: "Progress", icon: BookOpen },
  { href: "/admin/engagement", label: "Engagement", icon: Users },
  { href: "/admin/performance", label: "Performance", icon: Trophy },
  { href: "/admin/compare", label: "Compare", icon: Columns },
  { href: "/admin/alerts", label: "Insights", icon: Bell },
  { href: "/admin/exam-deadlines", label: "Exam Deadlines", icon: CalendarClock },
  { href: "/admin/assessments", label: "Grades", icon: FileText },
  { href: "/admin/grades", label: "Grade Trends", icon: TrendingUp },
  { href: "/admin/grades/student", label: "Student Grades", icon: UserCheck },
  { href: "/admin/groups", label: "Groups", icon: FolderOpen },
  { href: "/admin/reports", label: "Reports", icon: Download },
  { href: "/admin/users", label: "Users", icon: UserCircle },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto py-3">
      {ADMIN_NAV.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
