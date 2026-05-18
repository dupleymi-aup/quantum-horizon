"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminError } from "@/components/admin/admin-error"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { useAdminUsersList, type AdminUser } from "@/hooks/api/use-admin-analytics"
import { Plus, FileText } from "lucide-react"

interface Assessment {
  id: string
  title: string
  description: string | null
  topic: string
  maxScore: number
  createdAt: string
  _count: { grades: number }
}

interface Grade {
  id: string
  score: number
  maxScore: number
  user: { id: string; name: string | null; email: string | null }
  assessment: { title: string; maxScore: number; topic: string }
}

export default function AdminAssessmentsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [showGrade, setShowGrade] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const queryClient = useQueryClient()

  const {
    data: assessments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["adminAssessments"],
    queryFn: async () => {
      const res = await fetchWithTimeout("/api/admin/assessments", { timeoutMs: 10000 })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
      const json = (await res.json()) as { data: Assessment[] }
      return json.data
    },
  })

  const { data: grades } = useQuery({
    queryKey: ["adminGrades", selectedAssessment],
    queryFn: async () => {
      const res = await fetchWithTimeout(
        `/api/admin/assessments?assessmentId=${selectedAssessment}`,
        { timeoutMs: 10000 }
      )
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
      const json = (await res.json()) as { data: Grade[] }
      return json.data
    },
    enabled: Boolean(selectedAssessment),
  })

  const createAssessment = useMutation({
    mutationFn: async (data: { title: string; topic: string; maxScore: number }) => {
      const res = await fetchWithTimeout("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        timeoutMs: 10000,
      })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminAssessments"] })
      setShowCreate(false)
    },
  })

  if (error) {
    return <AdminError message="Failed to load assessments" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center">Loading assessments...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assessments & Grades</h2>
        <Button
          onClick={() => {
            setShowCreate(!showCreate)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {showCreate && (
        <CreateForm
          onSubmit={(d) => {
            createAssessment.mutate(d)
          }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessments ({assessments?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments && assessments.length > 0 ? (
              <div className="space-y-2">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
                    onClick={() => {
                      setSelectedAssessment(a.id)
                    }}
                  >
                    <div>
                      <p className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        {a.title}
                      </p>
                      <p className="text-muted-foreground text-sm">{a.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{a.maxScore} pts</Badge>
                      <Badge>{a._count.grades} grades</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No assessments yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedAssessment
                ? `Grades: ${assessments?.find((a) => a.id === selectedAssessment)?.title ?? ""}`
                : "Grades"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grades && grades.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((g) => {
                    const pct = Math.round((g.score / g.maxScore) * 100)
                    return (
                      <TableRow key={g.id}>
                        <TableCell>{g.user.name ?? g.user.email ?? "Unknown"}</TableCell>
                        <TableCell className="text-right">
                          {g.score}/{g.maxScore}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-medium ${
                              pct >= 80
                                ? "text-green-600"
                                : pct >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {pct}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                {selectedAssessment ? "No grades recorded" : "Select an assessment"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          setShowGrade(!showGrade)
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Grade
      </Button>

      {showGrade && <GradeForm assessments={assessments ?? []} />}
    </div>
  )
}

function CreateForm({
  onSubmit,
}: {
  onSubmit: (d: { title: string; topic: string; maxScore: number }) => void
}) {
  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [maxScore, setMaxScore] = useState(100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />
        <Input
          placeholder="Topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
          }}
        />
        <Input
          type="number"
          placeholder="Max Score"
          value={maxScore}
          onChange={(e) => {
            setMaxScore(parseInt(e.target.value, 10))
          }}
        />
        <Button
          onClick={() => {
            if (title && topic) onSubmit({ title, topic, maxScore })
          }}
        >
          Create
        </Button>
      </CardContent>
    </Card>
  )
}

function GradeForm({ assessments }: { assessments: Assessment[] }) {
  const [assessmentId, setAssessmentId] = useState("")
  const [userId, setUserId] = useState("")
  const [score, setScore] = useState(0)
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data } = useAdminUsersList(1, search)

  const submitGrade = useMutation({
    mutationFn: async () => {
      const res = await fetchWithTimeout("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, userId, score }),
        timeoutMs: 10000,
      })
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminGrades"] })
      void queryClient.invalidateQueries({ queryKey: ["adminAssessments"] })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Grade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={assessmentId} onValueChange={setAssessmentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select assessment" />
          </SelectTrigger>
          <SelectContent>
            {assessments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search student..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
        <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-1">
          {data?.users.map((u: AdminUser) => (
            <button
              key={u.id}
              onClick={() => {
                setUserId(u.id)
              }}
              className={`w-full rounded px-2 py-1 text-left text-sm ${userId === u.id ? "bg-primary/10" : "hover:bg-accent"}`}
            >
              {u.name ?? u.email}
            </button>
          ))}
        </div>

        <Input
          type="number"
          placeholder="Score"
          value={score}
          onChange={(e) => {
            setScore(parseInt(e.target.value, 10))
          }}
        />
        <Button
          onClick={() => {
            if (assessmentId && userId) submitGrade.mutate()
          }}
        >
          Submit Grade
        </Button>
      </CardContent>
    </Card>
  )
}
