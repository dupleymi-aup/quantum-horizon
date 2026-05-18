import { useEffect } from "react"
import { SECTIONS, type Section } from "@/lib/constants-ui"

interface UseHomeKeyboardOptions {
  onSectionChange: (section: Section) => void
  onMenuToggle: () => void
  onMenuClose: () => void
  enabled?: boolean
}

export function useHomeKeyboard({
  onSectionChange,
  onMenuToggle,
  onMenuClose,
  enabled = true,
}: UseHomeKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key >= "1" && e.key <= "5") {
        const index = parseInt(e.key) - 1
        if (SECTIONS[index]) onSectionChange(SECTIONS[index])
      } else if (e.key === "m" || e.key === "M") {
        onMenuToggle()
      } else if (e.key === "Escape") {
        onMenuClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, onSectionChange, onMenuToggle, onMenuClose])
}
