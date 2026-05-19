"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SessionState {
  isRunning: boolean
  elapsedSeconds: number
  topic: string | undefined
}

const AUTOSAVE_INTERVAL_MS = 60_000 // 60 seconds

/**
 * Хук для отслеживания учебной сессии.
 * - Запускается при взаимодействии с визуализацией
 * - Автосохраняет каждые 60 секунд
 * - POST в /api/sessions при завершении
 */
export function useStudyTimer(topic?: string) {
  const [state, setState] = useState<SessionState>({
    isRunning: false,
    elapsedSeconds: 0,
    topic,
  })

  const lastSaveRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const topicRef = useRef<string | undefined>(topic)

  useEffect(() => {
    topicRef.current = topic
  }, [topic])

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning) return prev
      return { ...prev, isRunning: true, topic: topicRef.current ?? prev.topic }
    })
  }, [])

  const stop = useCallback(async () => {
    setState((prev) => {
      if (!prev.isRunning) return prev
      return { ...prev, isRunning: false }
    })

    const elapsed = state.elapsedSeconds
    const currentTopic = topicRef.current

    if (elapsed < 10 || !currentTopic) return // Don't save very short sessions

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic,
          durationSec: elapsed - lastSaveRef.current,
        }),
      })
    } catch {
      // Silently fail — session tracking is non-critical
    }

    lastSaveRef.current = 0
  }, [state.elapsedSeconds])

  const reset = useCallback(() => {
    setState({ isRunning: false, elapsedSeconds: 0, topic: topicRef.current })
    lastSaveRef.current = 0
  }, [])

  // Timer tick
  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const newElapsed = prev.elapsedSeconds + 1

        // Auto-save every 60 seconds
        if (newElapsed - lastSaveRef.current >= 60 && prev.topic) {
          const savedDuration = newElapsed - lastSaveRef.current
          lastSaveRef.current = newElapsed

          // Fire-and-forget autosave
          fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: prev.topic,
              durationSec: savedDuration,
            }),
          }).catch(() => {})
        }

        return { ...prev, elapsedSeconds: newElapsed }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    ...state,
    start,
    stop,
    reset,
  }
}
