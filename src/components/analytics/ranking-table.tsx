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
import type { RankingEntry } from "@/hooks/api/use-admin-analytics"

interface RankingTableProps {
  data: RankingEntry[]
  title?: string
}

type SortKey = "rank" | "name" | "totalXp" | "activityCount"
type SortDir = "asc" | "desc"

function getMedal(rank: number): string {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return `${rank}`
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString()
}

export function RankingTable({ data, title = "Student Rankings" }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "rank" ? "asc" : "desc")
    }
  }

  const sorted = [...data].sort((a, b) => {
    let cmp = 0
    if (sortKey === "rank") cmp = 0
    else if (sortKey === "name") cmp = a.name.localeCompare(b.name)
    else if (sortKey === "totalXp") cmp = a.totalXp - b.totalXp
    else cmp = a.activityCount - b.activityCount

    return sortDir === "asc" ? cmp : -cmp
  })

  const ranked = sorted.map((entry, i) => ({
    ...entry,
    rank: sortKey === "rank"
      ? (sortDir === "asc" ? i + 1 : sorted.length - i)
      : i + 1,
  }))

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">No ranking data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                Student {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("totalXp")}
              >
                Total XP {sortKey === "totalXp" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort("activityCount")}
              >
                Activities {sortKey === "activityCount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map((entry) => (
              <TableRow key={entry.userId}>
                <TableCell className="font-medium">
                  {getMedal(entry.rank)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{entry.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">{entry.totalXp.toLocaleString()}</TableCell>
                <TableCell className="text-right">{entry.activityCount}</TableCell>
                <TableCell>{formatDate(entry.lastActive)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
