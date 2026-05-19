"use client"

import { useState } from "react"
import { useI18n } from "@/i18n/use-i18n"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description?: string
    topic?: string
    deadline: string
    type: "PERSONAL" | "STUDY" | "EXAM"
  }) => Promise<void>
  initialData?: {
    title: string
    description?: string
    topic?: string
    deadline: string
    type: "PERSONAL" | "STUDY" | "EXAM"
  }
  isSubmitting?: boolean
}

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function ReminderDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: ReminderDialogProps) {
  const t = useI18n()
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [topic, setTopic] = useState(initialData?.topic ?? "")
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? toLocalDateTime(new Date(initialData.deadline)) : toLocalDateTime(new Date())
  )
  const [type, setType] = useState<"PERSONAL" | "STUDY" | "EXAM">(initialData?.type ?? "PERSONAL")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      topic: topic.trim() || undefined,
      deadline: new Date(deadline).toISOString(),
      type,
    })
    if (!initialData) {
      setTitle("")
      setDescription("")
      setTopic("")
      setDeadline(toLocalDateTime(new Date()))
      setType("PERSONAL")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? t("reminders.editReminder") : t("reminders.createReminder")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reminders.typeLabel")}</label>
            <Select value={type} onValueChange={(v) => setType(v as "PERSONAL" | "STUDY" | "EXAM")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">{t("reminders.type.PERSONAL")}</SelectItem>
                <SelectItem value="STUDY">{t("reminders.type.STUDY")}</SelectItem>
                <SelectItem value="EXAM">{t("reminders.type.EXAM")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reminders.titlePlaceholder")}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("reminders.titlePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reminders.descriptionPlaceholder")}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("reminders.descriptionPlaceholder")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reminders.topicPlaceholder")}</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("reminders.topicPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("reminders.deadlineLabel")}</label>
            <Input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("reminders.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !deadline}>
              {t("reminders.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
