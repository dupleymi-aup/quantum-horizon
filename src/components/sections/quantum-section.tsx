"use client"

import { memo } from "react"
import { useTranslations } from "next-intl"
import { VisualizationCard } from "@/components/visualizations/base/visualization-card"
import {
  WaveFunctionVisualization,
  UncertaintyVisualization,
  TunnelingVisualization,
  DoubleSlitVisualization,
  PhotoelectricEffectVisualization,
  BrownianMotionVisualization,
  SchrodingersCatVisualization,
  QuantumEntanglementVisualization,
  AtomicModelVisualization,
  RadioactiveDecayVisualization,
  SuperconductivityVisualization,
} from "@/components/visualizations/lazy"

interface QuantumSectionProps {
  isDark: boolean
}

export const QuantumSection = memo(function QuantumSection({ isDark }: QuantumSectionProps) {
  const t = useTranslations()

  return (
    <>
      <VisualizationCard
        title={t("waveFunction")}
        description={t("waveFunctionDesc")}
        color="purple"
        isDark={isDark}
      >
        <WaveFunctionVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("uncertainty")}
        description={t("uncertaintyDesc")}
        color="blue"
        isDark={isDark}
      >
        <UncertaintyVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("tunneling")}
        description={t("tunnelingDesc")}
        color="green"
        isDark={isDark}
      >
        <TunnelingVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("doubleSlit")}
        description={t("doubleSlitDesc")}
        color="pink"
        isDark={isDark}
      >
        <DoubleSlitVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("photoelectric")}
        description={t("photoelectricDesc")}
        color="yellow"
        isDark={isDark}
      >
        <PhotoelectricEffectVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("brownianMotion")}
        description={t("brownianMotionDesc")}
        color="orange"
        isDark={isDark}
      >
        <BrownianMotionVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("schrodingersCat")}
        description={t("schrodingersCatDesc")}
        color="purple"
        isDark={isDark}
      >
        <SchrodingersCatVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("quantumEntanglement")}
        description={t("quantumEntanglementDesc")}
        color="pink"
        isDark={isDark}
      >
        <QuantumEntanglementVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("atomicModel")}
        description={t("atomicModelDesc")}
        color="cyan"
        isDark={isDark}
      >
        <AtomicModelVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("radioactiveDecay")}
        description={t("radioactiveDecayDesc")}
        color="green"
        isDark={isDark}
      >
        <RadioactiveDecayVisualization isDark={isDark} />
      </VisualizationCard>
      <VisualizationCard
        title={t("superconductivity")}
        description={t("superconductivityDesc")}
        color="cyan"
        isDark={isDark}
      >
        <SuperconductivityVisualization isDark={isDark} />
      </VisualizationCard>
    </>
  )
})
