"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/analytics"
import { AdminError } from "@/components/admin/admin-error"
import { AdminStatCardSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeleton"
import { useAtRiskReport, type MasteryLevel } from "@/hooks/api/use-admin-reports"
import { escapeCSV, buildCSV, downloadCSV } from "@/lib/csv"
import { Download, AlertTriangle, AlertCircle, TrendingDown, Clock } from "lucide-react"

const MASTERY_COLORS: Record<MasteryLevel, string> = {
  advanced: "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400",
  proficient: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
  developing: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400",
  beginner: "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400",
}

const RISK_FACTOR_COLORS: Record<string, string> = {
  declining_grades: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  inactive_14d: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  low_mastery: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  low_activity: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

function getRiskColor(score: number): string {
  if (score >= 70) return "text-red-600"
  if (score >= 40) return "text-orange-600"
  return "text-yellow-600"
}

function formatRiskFactor(factor: string): string {
  return factor.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminAtRiskReportPage() {
  const { data, isLoading, error, refetch } = useAtRiskReport()

  const handleExportCSV = () => {
    if (!data?.atRiskStudents.length) return
    const headers = [
      "Name",
      "Email",
      "Avg Score",
      "Trend",
      "Mastery",
      "Days Inactive",
      "Risk Score",
      "Risk Factors",
      "Weakest Topic",
    ]
    const rows = data.atRiskStudents.map((s) => [
      escapeCSV(s.name || "Unknown"),
      escapeCSV(s.email || ""),
      String(s.avgScore),
      s.trendDirection,
      s.masteryLevel,
      String(s.daysSinceLastActivity),
      String(s.riskScore),
      s.riskFactors.map(formatRiskFactor).join("; "),
      escapeCSV(s.weakestTopic || ""),
    ])
    downloadCSV(buildCSV(headers, rows), "at_risk_students.csv")
  }

  if (error) {
    return <AdminError message="Failed to load at-risk report" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <AdminStatCardSkeleton key={i} />
          ))}
        </div>
        <AdminTableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">At-Risk Student Early Warning</h2>
        <Button onClick={handleExportCSV} disabled={!data?.atRiskStudents.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={AlertTriangle}
            label="Total At-Risk"
            value={data.summary.totalAtRisk}
          />
          <StatCard
            icon={AlertCircle}
            label="Critical"
            value={data.summary.criticalCount}
          />
          <StatCard
            icon={TrendingDown}
            label="Declining Trend"
            value={data.atRiskStudents.filter((s) => s.trendDirection === "declining").length}
          />
          <StatCard
            icon={Clock}
            label="Inactive 14+ Days"
            value={data.atRiskStudents.filter((s) => s.daysSinceLastActivity >= 14).length}
          />
        </div>
      )}

      {data?.summary.mostCommonRiskFactor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common Risk Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatRiskFactor(data.summary.mostCommonRiskFactor)}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.atRiskStudents.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              No at-risk students identified
            </p>
          )}
          {data && data.atRiskStudents.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Mastery</TableHead>
                    <TableHead className="text-center">Inactive (days)</TableHead>
                    <TableHead className="text-center">Risk Score</TableHead>
                    <TableHead>Risk Factors</TableHead>
                    <TableHead>Weakest Topic</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.atRiskStudents.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{student.avgScore}%</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            student.trendDirection === "declining"
                              ? "destructive"
                              : student.trendDirection === "improving"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {student.trendDirection}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={MASTERY_COLORS[student.masteryLevel]}>
                          {student.masteryLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{student.daysSinceLastActivity}</TableCell>
                      <TableCell className={`text-center font-semibold ${getRiskColor(student.riskScore)}`}>
                        {student.riskScore}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.riskFactors.map((factor) => (
                            <Badge key={factor} className={RISK_FACTOR_COLORS[factor] || "bg-gray-100"}>
                              {formatRiskFactor(factor)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {student.weakestTopic ? student.weakestTopic.replace(/_/g, " ") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
