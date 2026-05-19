"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Users, AlertTriangle, Grid3x3, Target, Zap } from "lucide-react"

const REPORT_TYPES = [
  {
    href: "/admin/reports/student-performance",
    title: "Student Performance Report",
    description: "Detailed performance analysis for individual students including topic mastery, class percentile ranking, grade timeline, and areas for improvement.",
    icon: BarChart3,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    href: "/admin/reports/class-performance",
    title: "Class Performance Report",
    description: "Class-wide performance overview with grade distribution, topic analysis, top/bottom performers, most difficult assessments, and trends over time.",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    href: "/admin/reports/at-risk",
    title: "At-Risk Student Early Warning",
    description: "Identifies students who need intervention based on declining grades, inactivity, low mastery, and low engagement. Includes risk scoring and actionable insights.",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    href: "/admin/reports/topic-mastery",
    title: "Topic Mastery Heatmap",
    description: "Visual cross-topic mastery distribution showing which topics the cohort struggles with or excels at. Reveals curriculum weak points at a glance.",
    icon: Grid3x3,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    href: "/admin/reports/group-comparison",
    title: "Student Group Comparison",
    description: "Compare performance across student groups with side-by-side metrics, grade trends per group, and topic-level breakdowns.",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  {
    href: "/admin/reports/engagement-grades",
    title: "Engagement & Grade Correlation",
    description: "Cross-domain analysis correlating student activity with academic performance. Identifies engaged-but-low-performing students needing different interventions.",
    icon: Target,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950",
  },
  {
    href: "/admin/reports/learning-velocity",
    title: "Learning Velocity Report",
    description: "Tracks how quickly students progress through topics. Identifies students who need more support and those ready for advanced material.",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
]

export default function AdminReportsHubPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reports Hub</h2>
      </div>

      <p className="text-muted-foreground text-sm">
        Generate and export 7 detailed performance reports for students, groups, and curriculum analysis.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {REPORT_TYPES.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${report.bgColor}`}>
                    <report.icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Export to CSV
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
