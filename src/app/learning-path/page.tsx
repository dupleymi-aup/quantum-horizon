"use client"

import { useState, useEffect } from "react"
import { LearningPath } from "@/components/ui/learning-path"
import { useUserProgress } from "@/hooks/api/use-user-progress"

export default function LearningPathPage() {
  const { progress, loading } = useUserProgress()
  const [completedTopics, setCompletedTopics] = useState<string[]>([])

  useEffect(() => {
    if (progress && progress.length > 0) {
      setCompletedTopics(progress.filter((p) => p.completedCount > 0).map((p) => p.topic))
    }
  }, [progress])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Learning Path</h1>
        <p className="mt-2 text-gray-400">
          Your visual progression through physics. Complete topics in order to unlock advanced content.
        </p>
        <div className="mt-3 flex gap-4 text-xs">
          <span className="text-green-400">✅ Completed</span>
          <span className="text-cyan-400">🔓 Available</span>
          <span className="text-gray-500">🔒 Locked</span>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : (
        <LearningPath completedTopics={completedTopics} />
      )}
    </div>
  )
}
