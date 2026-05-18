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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminError } from "@/components/admin/admin-error"
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton"
import { useAdminUsersList, type AdminUser } from "@/hooks/api/use-admin-analytics"
import { Search } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

function formatShortDate(iso: string | null): string {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString()
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [inputValue, setInputValue] = useState("")

  const { data, isLoading, error, refetch } = useAdminUsersList(page, search, roleFilter)

  const handleSearch = () => {
    setSearch(inputValue)
    setPage(1)
  }

  if (error) {
    return <AdminError message="Failed to load users" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return <AdminTableSkeleton rows={8} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search by name or email..."
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
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="MODERATOR">Moderator</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">Activities</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {user.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>{user.email ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : user.role === "MODERATOR"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{user.totalXp.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{user.activityCount}</TableCell>
                  <TableCell>{formatShortDate(user.lastActive)}</TableCell>
                  <TableCell>{formatDate(new Date(user.createdAt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => {
                    setPage((p) => p - 1)
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => {
                    setPage((p) => p + 1)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
