"use client"

import { useState } from "react"
import { useI18n } from "@/i18n/use-i18n"
import { Bell, Trash2, CalendarClock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReminders } from "@/hooks/api/use-reminders"
import { ReminderDialog } from "@/components/reminders/reminder-dialog"
import { Button } from "@/components/ui/button"

type ReminderType = "PERSONAL" | "STUDY" | "EXAM" | null

export default function RemindersPage() {
  const t = useI18n()
  const { reminders, isLoading, createReminder, deleteReminder, isCreating, isDeleting } = useReminders()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<ReminderType>(null)

  const handleCreateReminder = async (data: {
    title: string
    description?: string
    topic?: string
    deadline: string
    type: "PERSONAL" | "STUDY" | "EXAM"
  }) => {
    await createReminder(data)
  }

  const handleDeleteReminder = async (id: string) => {
    await deleteReminder(id)
  }

  const filtered = filterType ? reminders.filter((r) => r.type === filterType) : reminders

  const formatDeadlineDate = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 0) return t("reminders.overdue")
    if (diffHours === 0) return `${String(Math.floor(diffMs / (1000 * 60)))} min left`
    if (diffHours < 24) return `${String(diffHours)}h left`
    if (diffDays === 1) return t("reminders.dueToday")
    return `${String(diffDays)}d left`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "EXAM": return "bg-red-500/20 text-red-500"
      case "STUDY": return "bg-blue-500/20 text-blue-500"
      default: return "bg-gray-500/20 text-gray-500"
    }
  }

  const tabs: Array<{ type: ReminderType; label: string }> = [
    { type: null, label: "All" },
    { type: "PERSONAL", label: t("reminders.type.PERSONAL") },
    { type: "STUDY", label: t("reminders.type.STUDY") },
    { type: "EXAM", label: t("reminders.type.EXAM") },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-7 text-yellow-500" />
          <h1 className="text-2xl font-bold">{t("reminders.title")}</h1>
        </div>
        <Button onClick={() => { setDialogOpen(true); }}>
          <Plus className="mr-1 size-4" />
          {t("reminders.createReminder")}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => { setFilterType(tab.type); }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filterType === tab.type
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-muted-foreground py-12 text-center">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between rounded-xl border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 rounded-full px-2.5 py-1 text-xs font-medium", getTypeColor(r.type))}>
                  {t(`reminders.type.${r.type}`)}
                </div>
                <div>
                  <div className="text-base font-semibold">{r.title}</div>
                  {r.description && (
                    <div className="text-muted-foreground text-sm">{r.description}</div>
                  )}
                  <div className="text-muted-foreground mt-1 text-sm">
                    {r.topic && <span className="mr-1">{r.topic} ·</span>}
                    <CalendarClock className="mr-1 inline size-3" />
                    {new Date(r.deadline).toLocaleString()} · {formatDeadlineDate(r.deadline)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-red-500"
                onClick={() => void handleDeleteReminder(r.id)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground py-12 text-center">
            <Bell className="mx-auto mb-3 size-12 opacity-30" />
            {t("reminders.noReminders")}
          </div>
        )}
      </div>

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateReminder}
        isSubmitting={isCreating}
      />
    </div>
  )
}
