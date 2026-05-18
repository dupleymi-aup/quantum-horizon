"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminError } from "@/components/admin/admin-error"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { useAdminUsersList, type AdminUser } from "@/hooks/api/use-admin-analytics"
import { Plus, Trash2, Users } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: { members: number }
}

export default function AdminGroupsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: groups,
    isLoading,
    error,
    refetch,
  } = useQuery<Group[]>({
    queryKey: ["adminGroups"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/groups", { timeoutMs: 10000 })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
      const json = (await res.json()) as { data: Group[] }
      return json.data
    },
  })

  if (error) {
    return <AdminError message="Failed to load groups" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center">Loading groups...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Student Groups</h2>
        <Button
          onClick={() => {
            setShowCreate(!showCreate)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>

      {showCreate && (
        <CreateGroupForm
          onCreated={() => {
            void queryClient.invalidateQueries({ queryKey: ["adminGroups"] })
            setShowCreate(false)
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((g) => (
          <Card key={g.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                {g.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {g.description && (
                <p className="text-muted-foreground mb-3 text-sm">{g.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge>{g._count.members} members</Badge>
                <DeleteGroupButton id={g.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups?.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            No groups created yet. Create one to start cohort analysis.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreateGroupForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data } = useAdminUsersList(1, search)

  const createGroup = useMutation({
    mutationFn: async () => {
      const res = await fetchWithTimeout("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, memberIds: selectedIds }),
        timeoutMs: 10000,
      })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminGroups"] })
      onCreated()
    },
  })

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Group name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
          }}
        />

        <Input
          placeholder="Search students to add..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
        <div className="max-h-40 space-y-1 overflow-y-auto rounded border p-1">
          {data?.users.map((u: AdminUser) => (
            <button
              key={u.id}
              onClick={() => {
                toggleUser(u.id)
              }}
              className={`w-full rounded px-2 py-1 text-left text-sm transition-colors ${
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
        <p className="text-muted-foreground text-sm">{selectedIds.length} students selected</p>

        <Button
          onClick={() => {
            if (name) createGroup.mutate()
          }}
          disabled={!name || createGroup.isPending}
        >
          Create Group
        </Button>
      </CardContent>
    </Card>
  )
}

function DeleteGroupButton({ id }: { id: string }) {
  const queryClient = useQueryClient()

  const deleteGroup = useMutation({
    mutationFn: async () => {
      const res = await fetchWithTimeout(`/api/admin/groups?id=${id}`, {
        method: "DELETE",
        timeoutMs: 10000,
      })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminGroups"] })
    },
  })

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        deleteGroup.mutate()
      }}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
