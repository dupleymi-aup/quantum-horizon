// Система горячих клавиш

import { useEffect, useCallback } from "react"

export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category: "navigation" | "playback" | "settings" | "general"
  modifier?: "ctrl" | "shift" | "alt" | "meta"
}

const SHORTCUT_EVENT = "quantum-shortcut"

export function dispatchShortcut(id: string): void {
  window.dispatchEvent(new CustomEvent(SHORTCUT_EVENT, { detail: id }))
}

export function onShortcut(id: string, handler: () => void): () => void {
  const listener = (e: Event) => {
    if ((e as CustomEvent).detail === id) handler()
  }
  window.addEventListener(SHORTCUT_EVENT, listener)
  return () => {
    window.removeEventListener(SHORTCUT_EVENT, listener)
  }
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: "Space",
    description: "Старт/Пауза анимации",
    action: () => {
      dispatchShortcut("play-toggle")
    },
    category: "playback",
  },
  {
    key: "R",
    description: "Сброс настроек",
    action: () => {
      dispatchShortcut("play-reset")
    },
    category: "playback",
  },
  {
    key: "+",
    description: "Увеличить скорость",
    action: () => {
      dispatchShortcut("play-speed-up")
    },
    category: "playback",
  },
  {
    key: "-",
    description: "Уменьшить скорость",
    action: () => {
      dispatchShortcut("play-speed-down")
    },
    category: "playback",
  },
  {
    key: "1",
    description: "Квантовая механика",
    action: () => {
      dispatchShortcut("nav-quantum")
    },
    category: "navigation",
  },
  {
    key: "2",
    description: "Теория относительности",
    action: () => {
      dispatchShortcut("nav-relativity")
    },
    category: "navigation",
  },
  {
    key: "3",
    description: "Космология",
    action: () => {
      dispatchShortcut("nav-cosmos")
    },
    category: "navigation",
  },
  {
    key: "4",
    description: "Термодинамика",
    action: () => {
      dispatchShortcut("nav-thermodynamics")
    },
    category: "navigation",
  },
  {
    key: "5",
    description: "Продвинутые",
    action: () => {
      dispatchShortcut("nav-advanced")
    },
    category: "navigation",
  },
  {
    key: "F",
    description: "Полноэкранный режим",
    action: () => {
      dispatchShortcut("toggle-fullscreen")
    },
    category: "settings",
  },
  {
    key: "T",
    description: "Сменить тему",
    action: () => {
      dispatchShortcut("toggle-theme")
    },
    category: "settings",
  },
  {
    key: "L",
    description: "Сменить язык",
    action: () => {
      dispatchShortcut("cycle-language")
    },
    category: "settings",
  },
  {
    key: "H",
    description: "Показать справку",
    action: () => {
      dispatchShortcut("show-help")
    },
    category: "general",
  },
  {
    key: "?",
    description: "Показать горячие клавиши",
    action: () => {
      dispatchShortcut("show-shortcuts")
    },
    category: "general",
  },
]

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Игнорируем если фокус в input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase()
        const modifierMatch =
          !s.modifier ||
          (s.modifier === "ctrl" && event.ctrlKey) ||
          (s.modifier === "shift" && event.shiftKey) ||
          (s.modifier === "alt" && event.altKey) ||
          (s.modifier === "meta" && event.metaKey)

        return keyMatch && modifierMatch
      })

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

export function getShortcutsByCategory(category: string): KeyboardShortcut[] {
  return DEFAULT_SHORTCUTS.filter((s) => s.category === category)
}

export function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    " ": "Space",
    "+": "+",
    "-": "-",
  }
  return keyMap[key] || key.toUpperCase()
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case "navigation":
      return "🧭"
    case "playback":
      return "▶️"
    case "settings":
      return "⚙️"
    case "general":
      return "ℹ️"
    default:
      return "🎯"
  }
}

export function getCategoryName(category: string): string {
  switch (category) {
    case "navigation":
      return "Навигация"
    case "playback":
      return "Воспроизведение"
    case "settings":
      return "Настройки"
    case "general":
      return "Общие"
    default:
      return category
  }
}
