"use client"

import { memo } from "react"
import { useTranslations } from "next-intl"
import { VisualizationCard } from "@/components/visualizations/base/visualization-card"
import {
  GravitationalWavesVisualization,
  FormulaCalculator,
  PhysicsTimeline,
  PhysicsQuiz,
  ScientistsBiographies,
} from "@/components/visualizations/lazy"

interface AdvancedSectionProps {
  isDark: boolean
}

export const AdvancedSection = memo(function AdvancedSection({ isDark }: AdvancedSectionProps) {
  const t = useTranslations()

  return (
    <>
      <VisualizationCard
        title={t("gravitationalWaves")}
        description={t("gravitationalWavesDesc")}
        color="purple"
        isDark={isDark}
      >
        <GravitationalWavesVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("calculator")}
        description={t("calculatorDesc")}
        color="purple"
        isDark={isDark}
      >
        <FormulaCalculator />
      </VisualizationCard>
      <VisualizationCard
        title={t("timeline")}
        description={t("timelineDesc")}
        color="purple"
        isDark={isDark}
      >
        <PhysicsTimeline />
      </VisualizationCard>
      <VisualizationCard
        title={t("physicsQuiz")}
        description={t("physicsQuizDesc")}
        color="cyan"
        isDark={isDark}
      >
        <PhysicsQuiz />
      </VisualizationCard>
      <VisualizationCard
        title={t("scientists")}
        description={t("scientistsDesc")}
        color="yellow"
        isDark={isDark}
      >
        <ScientistsBiographies />
      </VisualizationCard>
    </>
  )
})
