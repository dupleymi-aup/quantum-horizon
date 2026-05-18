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
  return String(rank)
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
    const mul = sortDir === "asc" ? 1 : -1
    if (sortKey === "name") return mul * a.name.localeCompare(b.name)
    if (sortKey === "totalXp") return mul * (a.totalXp - b.totalXp)
    return mul * (a.activityCount - b.activityCount)
  })

  const ranked = sorted.map((entry, i) => ({
    ...entry,
    rank: sortKey === "rank" ? (sortDir === "asc" ? i + 1 : sorted.length - i) : i + 1,
  }))

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            No ranking data available
          </p>
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
                onClick={() => {
                  handleSort("name")
                }}
              >
                Student {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right select-none"
                onClick={() => {
                  handleSort("totalXp")
                }}
              >
                Total XP {sortKey === "totalXp" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right select-none"
                onClick={() => {
                  handleSort("activityCount")
                }}
              >
                Activities {sortKey === "activityCount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map((entry) => (
              <TableRow key={entry.userId}>
                <TableCell className="font-medium">{getMedal(entry.rank)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.name || "Unknown"}</p>
                    <p className="text-muted-foreground text-xs">{entry.email}</p>
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
