"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string | null
  memberCount: number
  createdAt: string
}

async function fetchStudentGroups(): Promise<{ groups: Group[] }> {
  const res = await fetch("/api/student/groups")
  if (!res.ok) throw new Error("Failed to fetch groups")
  return res.json() as Promise<{ groups: Group[] }>
}

export default function StudentGroupsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["student-groups"],
    queryFn: fetchStudentGroups,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">Ошибка загрузки данных</p>
      </div>
    )
  }

  const groups: Group[] = data?.groups ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мои группы</h1>
        <p className="text-muted-foreground mt-1">Группы, в которых вы состоите</p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Вы пока не состоите ни в одной группе
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.name}
                </CardTitle>
                {group.description && <CardDescription>{group.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{group.memberCount} участников</Badge>
                  <p className="text-muted-foreground text-xs">
                    С {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
