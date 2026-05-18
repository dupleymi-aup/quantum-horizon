"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminError } from "@/components/admin/admin-error"
import { useAdminUsersList, type AdminUser } from "@/hooks/api/use-admin-analytics"
import { useStudentComparison, type ComparisonStudent } from "@/hooks/api/use-admin-features"
import { Search, X, BarChart3 } from "lucide-react"

export default function AdminComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [page, setPage] = useState(1)

  const { data: usersData, isLoading: usersLoading } = useAdminUsersList(page, search)
  const {
    data: comparison,
    isLoading: compareLoading,
    error: compareError,
  } = useStudentComparison(selectedIds)

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    )
  }

  const handleSearch = () => {
    setSearch(inputValue)
    setPage(1)
  }

  if (compareError) {
    return <AdminError message="Failed to load comparison data" />
  }

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Students to Compare (2-5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedIds.map((id) => (
              <Badge key={id} variant="default" className="gap-1">
                {id.slice(-4)}
                <button
                  onClick={() => {
                    toggleUser(id)
                  }}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedIds.length === 0 && (
              <span className="text-muted-foreground text-sm">
                No students selected. Click names below to add.
              </span>
            )}
          </div>

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Search students..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="max-w-sm"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {usersLoading ? (
            <p className="text-muted-foreground text-sm">Loading users...</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
              {usersData?.users.map((u: AdminUser) => (
                <button
                  key={u.id}
                  onClick={() => {
                    toggleUser(u.id)
                  }}
                  className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
                    selectedIds.includes(u.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  }`}
                >
                  {u.name ?? u.email ?? u.id.slice(-6)}
                  <span className="text-muted-foreground ml-2 text-xs">XP: {u.totalXp}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && comparison.length >= 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparison Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {comparison.map((s: ComparisonStudent) => (
                      <TableHead key={s.user.id} className="text-right">
                        {s.user.name ?? s.user.email ?? "Unknown"}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      label: "Total XP",
                      values: comparison.map((s: ComparisonStudent) => s.totalXp.toLocaleString()),
                    },
                    {
                      label: "Activities",
                      values: comparison.map((s: ComparisonStudent) => String(s.totalActivities)),
                    },
                    {
                      label: "Achievements",
                      values: comparison.map((s: ComparisonStudent) => String(s.totalAchievements)),
                    },
                    {
                      label: "Session Time",
                      values: comparison.map((s: ComparisonStudent) =>
                        s.totalSessionTime < 3600
                          ? `${String(Math.round(s.totalSessionTime / 60))}m`
                          : `${String(Math.round(s.totalSessionTime / 3600))}h ${String(Math.round((s.totalSessionTime % 3600) / 60))}m`
                      ),
                    },
                    {
                      label: "Topics Completed",
                      values: comparison.map((s: ComparisonStudent) => String(s.topicsCompleted)),
                    },
                  ].map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {row.values.map((v, i) => (
                        <TableCell key={i} className="text-right">
                          {v}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Topic Comparison */}
          {comparison.some((s: ComparisonStudent) => s.topicCompletion.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Topic Completion Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      {comparison.map((s: ComparisonStudent) => (
                        <TableHead key={s.user.id} className="text-right">
                          {(s.user.name ?? "").split(" ")[0] ?? "User"}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      new Set(
                        comparison.flatMap((s: ComparisonStudent) =>
                          s.topicCompletion.map((t) => t.topic)
                        )
                      )
                    ).map((topic) => (
                      <TableRow key={topic}>
                        <TableCell className="font-medium">{topic}</TableCell>
                        {comparison.map((s: ComparisonStudent) => {
                          const found = s.topicCompletion.find((t) => t.topic === topic)
                          return (
                            <TableCell key={s.user.id} className="text-right">
                              {found ? found.count : "—"}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {compareLoading && (
        <p className="text-muted-foreground py-4 text-center">Loading comparison...</p>
      )}
    </div>
  )
}
