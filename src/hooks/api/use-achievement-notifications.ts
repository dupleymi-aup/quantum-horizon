"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useI18n } from "@/i18n/use-i18n"
import { useAddAchievement } from "@/hooks/api/use-user-progress"
import { getAchievementById, getRarityColor } from "@/lib/statistics"

const TOAST_STORAGE_KEY = "qh_achievement_toasts"

function getDismissedToasts(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(TOAST_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function dismissToast(achievementId: string) {
  if (typeof window === "undefined") return
  const dismissed = getDismissedToasts()
  dismissed.add(achievementId)
  localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify([...dismissed]))
}

/**
 * Хук для отображения toast-уведомлений при разблокировке достижений.
 * Отслеживает newlyUnlocked из мутации и показывает sonner toast.
 */
export function useAchievementToastNotifications() {
  const t = useI18n()
  const mutation = useAddAchievement()

  useEffect(() => {
    if (!mutation.data?.newlyUnlocked) return

    const achievementId = mutation.data.data?.achievementId
    if (!achievementId) return

    const dismissed = getDismissedToasts()
    if (dismissed.has(achievementId)) return

    const achievement = getAchievementById(achievementId)
    if (!achievement) return

    const colorMap: Record<string, string> = {
      common: "#6b7280",
      uncommon: "#22c55e",
      rare: "#3b82f6",
      epic: "#a855f7",
      legendary: "#eab308",
    }

    toast.success(
      `${achievement.icon} ${t(`achievements.${achievement.id}`) ?? achievement.name}`,
      {
        description: t(
          `achievements.${achievement.id}Desc`
        ) ?? achievement.description,
        style: {
          borderLeft: `4px solid ${colorMap[achievement.rarity] ?? "#6b7280"}`,
        },
        duration: 5000,
        onDismiss: () => { dismissToast(achievementId); },
        onAutoClose: () => { dismissToast(achievementId); },
      }
    )
  }, [mutation.data, t])

  return { getRarityColor }
}
