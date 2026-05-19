"use client"

import { VISUALIZATIONS_REGISTRY, type VisualizationMeta, type VisualizationCategory } from "@/lib/visualizations-registry"
import Link from "next/link"

const CATEGORY_COLORS: Record<VisualizationCategory, string> = {
  quantum: "border-cyan-500 bg-cyan-500/10",
  relativity: "border-purple-500 bg-purple-500/10",
  cosmos: "border-indigo-500 bg-indigo-500/10",
  thermodynamics: "border-orange-500 bg-orange-500/10",
  advanced: "border-pink-500 bg-pink-500/10",
}

const CATEGORY_LABELS: Record<VisualizationCategory, string> = {
  quantum: "Quantum Mechanics",
  relativity: "Relativity",
  cosmos: "Cosmos",
  thermodynamics: "Thermodynamics",
  advanced: "Advanced",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
}

function LearningPathNode({
  viz,
  completed,
  isLocked,
}: {
  viz: VisualizationMeta
  completed: boolean
  isLocked: boolean
}) {
  return (
    <div
      className={`group relative rounded-lg border p-3 transition-all ${
        completed
          ? "border-green-500/50 bg-green-500/10"
          : isLocked
            ? "border-gray-700 bg-gray-800/30 opacity-60"
            : CATEGORY_COLORS[viz.category]
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-white">{viz.title.en}</div>
          <div className="mt-1 flex items-center gap-2 text-[10px]">
            <span className={DIFFICULTY_COLORS[viz.difficulty]}>{viz.difficulty}</span>
            <span className="text-gray-500">{viz.estimatedTimeMin} min</span>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 text-lg">
          {completed ? "✅" : isLocked ? "🔒" : "🔓"}
        </div>
      </div>
      {!isLocked && !completed && (
        <Link
          href={`/visualizations/${viz.id}`}
          className="absolute inset-0 z-10"
          aria-label={`Go to ${viz.title.en}`}
        />
      )}
    </div>
  )
}

function PrerequisiteArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="h-4 w-px bg-gray-600" />
      <span className="mx-1 text-[10px] text-gray-500">{label}</span>
      <div className="h-4 w-px bg-gray-600" />
    </div>
  )
}

export function LearningPath({ completedTopics }: { completedTopics?: string[] }) {
  const completed = new Set(completedTopics ?? [])

  // Group by category
  const groups = new Map<VisualizationCategory, VisualizationMeta[]>()
  for (const viz of VISUALIZATIONS_REGISTRY) {
    const existing = groups.get(viz.category) ?? []
    existing.push(viz)
    groups.set(viz.category, existing)
  }

  // Build dependency graph for lock status
  function isVizLocked(viz: VisualizationMeta): boolean {
    if (!viz.prerequisites || viz.prerequisites.length === 0) return false
    // Locked if ANY prerequisite is not completed
    return viz.prerequisites.some((p) => !completed.has(p))
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            {CATEGORY_LABELS[category]}
            <span className="text-xs font-normal text-gray-400">
              ({items.length} visualizations)
            </span>
          </h2>
          <div className="space-y-0">
            {items.map((viz, idx) => {
              const locked = isVizLocked(viz)
              const done = completed.has(viz.id)

              return (
                <div key={viz.id}>
                  {/* Show prerequisite link if this viz has prerequisites */}
                  {viz.prerequisites &&
                    viz.prerequisites.map((prereqId) => {
                      const prereq = VISUALIZATIONS_REGISTRY.find((v) => v.id === prereqId)
                      if (!prereq) return null
                      return (
                        <PrerequisiteArrow
                          key={prereqId}
                          label={`requires: ${prereq.title.en}`}
                        />
                      )
                    })}
                  <LearningPathNode viz={viz} completed={done} isLocked={locked} />
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
