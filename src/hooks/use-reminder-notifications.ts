"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useI18n } from "@/i18n/use-i18n"
import { useCheckReminders, useDismissReminder } from "@/hooks/api/use-reminders"

const SESSION_STORAGE_KEY = "qh_reminder_shown"

function getShownIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function markShown(id: string) {
  if (typeof window === "undefined") return
  const shown = getShownIds()
  shown.add(id)
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([...shown]))
  } catch {
    // sessionStorage full — ignore
  }
}

function formatDeadline(dateStr: string, t: ReturnType<typeof useI18n>): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return t("reminders.overdue") ?? "Overdue"
  if (diffDays === 1) return t("reminders.dueToday") ?? "Due today"
  return (t("reminders.dueInDays") ?? "Due in {count} days").replace("{count}", String(diffDays))
}

/**
 * Хук для отображения toast-уведомлений о просроченных напоминаниях и предстоящих экзаменах.
 */
export function useReminderNotifications() {
  const t = useI18n()
  const { data } = useCheckReminders()
  const dismissMutation = useDismissReminder()

  useEffect(() => {
    if (!data) return

    const shown = getShownIds()

    for (const reminder of data.dueReminders) {
      if (shown.has(reminder.id)) continue

      toast.warning(reminder.title, {
        description: reminder.description ?? formatDeadline(reminder.deadline, t),
        duration: 15000,
        action: {
          label: t("reminders.dismiss") ?? "Dismiss",
          onClick: () => { markShown(reminder.id); },
        },
        onDismiss: () => { markShown(reminder.id); },
        onAutoClose: () => { markShown(reminder.id); },
      })
      markShown(reminder.id)
    }

    for (const exam of data.upcomingExams) {
      if (shown.has(exam.id)) continue

      const examDate = new Date(exam.examDate)
      const now = new Date()
      const diffDays = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      let message: string
      if (diffDays <= 0) {
        message = (t("reminders.examToday") ?? 'Exam "{title}" is today!').replace("{title}", exam.title)
      } else if (diffDays === 1) {
        message = (t("reminders.examTomorrow") ?? 'Exam "{title}" is tomorrow!').replace("{title}", exam.title)
      } else {
        message = (t("reminders.examInDays") ?? 'Exam "{title}" in {count} days')
          .replace("{title}", exam.title)
          .replace("{count}", String(diffDays))
      }

      toast.info(t("reminders.examReminder") ?? "Upcoming Exam", {
        description: message,
        duration: 15000,
        action: {
          label: t("reminders.snooze") ?? "Snooze",
          onClick: () => {
            const snoozeUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
            void dismissMutation.mutateAsync({ examDeadlineId: exam.id, snoozeUntil })
            markShown(exam.id)
          },
        },
        onDismiss: () => { markShown(exam.id); },
        onAutoClose: () => { markShown(exam.id); },
      })
      markShown(exam.id)
    }
  }, [data, t, dismissMutation])
}
