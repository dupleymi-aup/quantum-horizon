"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Users } from "lucide-react"

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
]

export default function AdminReportsHubPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reports Hub</h2>
      </div>

      <p className="text-muted-foreground text-sm">
        Generate and export detailed performance reports for students and classes.
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
