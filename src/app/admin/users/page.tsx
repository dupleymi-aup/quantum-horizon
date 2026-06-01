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
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
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
  const [roleFilter, setRoleFilter] = useState("all")
  const [inputValue, setInputValue] = useState("")

  const effectiveRole = roleFilter === "all" ? "" : roleFilter
  const { data, isLoading, error, refetch } = useAdminUsersList(page, search, effectiveRole)

  const handleSearch = () => {
    setSearch(inputValue)
    setPage(1)
  }

  if (error) {
    return (
      <AdminError message="Не удалось загрузить пользователей" onRetry={() => void refetch()} />
    )
  }

  if (isLoading) {
    return <AdminTableSkeleton rows={8} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Поиск по имени или email..."
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
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="USER">Студент</SelectItem>
            <SelectItem value="TEACHER">Преподаватель</SelectItem>
            <SelectItem value="MODERATOR">Модератор</SelectItem>
            <SelectItem value="ADMIN">Администратор</SelectItem>
          </SelectContent>
        </Select>
        <CreateUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="text-right">Активности</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead>Дата регистрации</TableHead>
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
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20 ring-inset"
                          : user.role === "MODERATOR"
                            ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 ring-inset"
                            : user.role === "TEACHER"
                              ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20 ring-inset"
                              : "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20 ring-inset"
                      }`}
                    >
                      {user.role === "USER"
                        ? "Студент"
                        : user.role === "ADMIN"
                          ? "Администратор"
                          : user.role === "MODERATOR"
                            ? "Модератор"
                            : "Преподаватель"}
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
                Страница {data.page} из {data.totalPages}
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
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => {
                    setPage((p) => p + 1)
                  }}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
