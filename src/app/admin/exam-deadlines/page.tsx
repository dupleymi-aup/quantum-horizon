"use client"

import { useMemo, useState } from "react"
import { useI18n } from "@/i18n/use-i18n"
import { CalendarClock, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { useExamDeadlines } from "@/hooks/api/use-reminders"
import { AdminError } from "@/components/admin/admin-error"
import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function getDefaultExamDate(): string {
  return toLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
}

export default function AdminExamDeadlinesPage() {
  const t = useI18n()
  const { exams, isLoading, error, createExam, deleteExam, isCreating, isDeleting } = useExamDeadlines()
  const [showCreate, setShowCreate] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const defaultExamDate = useMemo(() => getDefaultExamDate(), [])
  const [examDate, setExamDate] = useState(defaultExamDate)

  const handleCreate = async () => {
    if (!title.trim() || !topic.trim() || !examDate) return
    await createExam({
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim() || undefined,
      examDate: new Date(examDate).toISOString(),
      isActive: true,
    })
    setTitle("")
    setTopic("")
    setDescription("")
    setExamDate(getDefaultExamDate())
    setShowCreate(false)
  }

  const handleDelete = async (id: string) => {
    await deleteExam(id)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    // Use the update mutation from the hook — but useExamDeadlines doesn't expose update
    // We'll do it directly via fetch
    const res = await fetch(`/api/admin/exam-deadlines?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      // Invalidate the query cache by re-fetching
      window.location.reload()
    }
  }

  if (error) {
    return <AdminError message={error} onRetry={() => { window.location.reload(); }} />
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">
        <CalendarClock className="mr-2 inline size-7" />
        {t("admin.examDeadlines") ?? "Exam Deadlines"}
      </h1>
      <p className="mb-4 text-muted-foreground">
        {t("admin.examDeadlinesDesc") ?? "Manage exam deadlines that will be shown to all users as reminders."}
      </p>
      <AdminNav />

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("reminders.createReminder")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("reminders.titlePlaceholder")}</label>
              <Input value={title} onChange={(e) => { setTitle(e.target.value); }} placeholder="Final Exam" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("reminders.topicPlaceholder")}</label>
              <Input value={topic} onChange={(e) => { setTopic(e.target.value); }} placeholder="Quantum Mechanics" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">{t("reminders.descriptionPlaceholder")}</label>
              <Textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); }}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("reminders.deadlineLabel")}</label>
              <Input type="datetime-local" value={examDate} onChange={(e) => { setExamDate(e.target.value); }} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCreate} disabled={isCreating || !title.trim() || !topic.trim() || !examDate}>
              {t("reminders.save")}
            </Button>
            <Button variant="outline" onClick={() => { setShowCreate(false); }} disabled={isCreating}>
              {t("reminders.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Exams table */}
      <div className="rounded-xl border">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{t("reminders.upcomingExams")}</h2>
          <Button size="sm" onClick={() => { setShowCreate(!showCreate); }}>
            <Plus className="mr-1 size-4" />
            Add Exam
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : exams.length > 0 ? (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.topic}</TableCell>
                  <TableCell>{new Date(exam.examDate).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={exam.isActive ? "default" : "secondary"}>
                      {exam.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleToggleActive(exam.id, exam.isActive)}
                        title={exam.isActive ? "Deactivate" : "Activate"}
                      >
                        {exam.isActive ? (
                          <ToggleRight className="size-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="size-5 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDelete(exam.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No exam deadlines configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
