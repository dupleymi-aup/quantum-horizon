"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocale } from "next-intl"
import dynamic from "next/dynamic"
import { useOnboarding } from "@/components/ui/onboarding-tour"
import { useCommandPalette } from "@/components/ui/enhanced-command-palette"
import { useHomeKeyboard } from "@/hooks/use-home-keyboard"
import { useStudyTimer } from "@/hooks/use-study-timer"
import { type Section, type Language } from "@/lib/constants-ui"
import type { Theme } from "@/types"

// Lazy load heavy UI components to reduce initial bundle
const OnboardingTour = dynamic(
  () => import("@/components/ui/onboarding-tour").then((m) => m.OnboardingTour),
  { ssr: false, loading: () => null }
)

const EnhancedCommandPalette = dynamic(
  () => import("@/components/ui/enhanced-command-palette").then((m) => m.EnhancedCommandPalette),
  { ssr: false }
)

// Lazy load QuickActions to defer framer-motion bundle
const QuickActions = dynamic(
  () => import("@/components/ui/quick-actions").then((m) => m.QuickActions),
  { ssr: false, loading: () => null }
)

// Lazy load AnimatedBackground to defer canvas/animation bundle
const AnimatedBackground = dynamic(
  () => import("@/components/layout/animated-background").then((m) => m.AnimatedBackground),
  { ssr: false, loading: () => null }
)

// Lazy load layout components to improve FCP
const SideMenu = dynamic(() => import("@/components/layout/side-menu").then((m) => m.SideMenu), {
  ssr: false,
  loading: () => null,
})
const HeaderControls = dynamic(
  () => import("@/components/layout/header-controls").then((m) => m.HeaderControls),
  { ssr: false, loading: () => null }
)
const Navigation = dynamic(
  () => import("@/components/layout/navigation").then((m) => m.Navigation),
  { ssr: false, loading: () => null }
)
const HeroSection = dynamic(
  () => import("@/components/layout/hero-section").then((m) => m.HeroSection),
  { ssr: false, loading: () => null }
)
const SiteFooter = dynamic(
  () => import("@/components/layout/site-footer").then((m) => m.SiteFooter),
  { ssr: false, loading: () => null }
)

// Lazy load sections to reduce initial bundle size
const QuantumSection = dynamic(
  () => import("@/components/sections/quantum-section").then((m) => m.QuantumSection),
  { ssr: false }
)

const RelativitySection = dynamic(
  () => import("@/components/sections/relativity-section").then((m) => m.RelativitySection),
  { ssr: false }
)

const CosmosSection = dynamic(
  () => import("@/components/sections/cosmos-section").then((m) => m.CosmosSection),
  { ssr: false }
)

const ThermodynamicsSection = dynamic(
  () => import("@/components/sections/thermodynamics-section").then((m) => m.ThermodynamicsSection),
  { ssr: false }
)

const AdvancedSection = dynamic(
  () => import("@/components/sections/advanced-section").then((m) => m.AdvancedSection),
  { ssr: false }
)

const STORAGE_KEYS = {
  THEME: "physics-theme",
  LOCALE: "NEXT_LOCALE",
} as const

export default function Home() {
  const locale = useLocale()

  const [activeSection, setActiveSection] = useState<Section>("quantum")
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    const saved = localStorage.getItem(STORAGE_KEYS.THEME)
    if (saved === "dark" || saved === "light") return saved
    return "dark"
  })
  const [menuOpen, setMenuOpen] = useState(false)

  const { showOnboarding, completeOnboarding } = useOnboarding()
  const { isOpen: commandPaletteOpen, close: closeCommandPalette } = useCommandPalette()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  useEffect(() => {
    if (typeof window !== "undefined" && locale) {
      localStorage.setItem(STORAGE_KEYS.LOCALE, locale)
    }
  }, [locale])

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((prev) => !prev)
  }, [])
  const handleMenuClose = useCallback(() => {
    setMenuOpen(false)
  }, [])

  useHomeKeyboard({
    onSectionChange: setActiveSection,
    onMenuToggle: handleMenuToggle,
    onMenuClose: handleMenuClose,
  })

  const sectionTopics: Record<Section, string> = {
    quantum: "quantum_mechanics",
    relativity: "relativity",
    cosmos: "cosmology",
    thermodynamics: "thermodynamics",
    advanced: "advanced_physics",
  }

  const { start: startStudy, stop: stopStudy } = useStudyTimer(sectionTopics[activeSection])

  // Start timer when section changes
  useEffect(() => {
    const handleStop = async () => {
      await stopStudy()
    }
    const handleStart = async () => {
      await startStudy()
    }
    void handleStop()
    void handleStart()
  }, [activeSection, startStudy, stopStudy])

  const isRTL = locale === "he"
  const isDark = theme === "dark"

  const handleLanguageChange = (lang: Language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LOCALE, lang)
      window.location.reload()
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gray-950 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1),transparent_50%)] text-white"
          : "bg-gray-50 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_50%)] text-gray-900"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}

      <EnhancedCommandPalette
        isOpen={commandPaletteOpen}
        onClose={closeCommandPalette}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        theme={theme}
        onThemeChange={setTheme}
        isDark={isDark}
      />

      <QuickActions />

      {isDark && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="animate-pulse-glow absolute top-1/4 left-1/4 h-1 w-1 rounded-full bg-purple-500/30" />
          <div className="animate-pulse-glow absolute top-3/4 right-1/4 h-1 w-1 rounded-full bg-blue-500/30 delay-1000" />
          <div className="animate-pulse-glow absolute bottom-1/4 left-1/3 h-1 w-1 rounded-full bg-pink-500/30 delay-500" />
        </div>
      )}

      <AnimatedBackground isDark={isDark} />

      <SideMenu
        isOpen={menuOpen}
        onClose={handleMenuClose}
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
        locale={locale}
        theme={theme}
        onThemeChange={setTheme}
        onLanguageChange={handleLanguageChange}
        isDark={isDark}
      />

      <header
        className={`relative overflow-hidden border-b transition-colors duration-300 ${
          isDark
            ? "border-white/10 bg-gray-950/50 backdrop-blur-xl"
            : "border-gray-200/80 bg-white/50 backdrop-blur-xl"
        }`}
      >
        <div
          className={`animate-gradient-shift absolute inset-0 opacity-50 ${
            isDark
              ? "bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20"
              : "bg-gradient-to-r from-purple-100/30 via-blue-100/30 to-purple-100/30"
          }`}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:py-12">
          <HeaderControls
            locale={locale}
            theme={theme}
            onThemeChange={setTheme}
            _onMenuOpen={() => {
              setMenuOpen(true)
            }}
            isDark={isDark}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            language={locale}
            onLanguageChange={handleLanguageChange}
          />

          <HeroSection isDark={isDark} />
        </div>
      </header>

      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDark={isDark}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          {activeSection === "quantum" && <QuantumSection isDark={isDark} />}
          {activeSection === "relativity" && <RelativitySection isDark={isDark} />}
          {activeSection === "cosmos" && <CosmosSection isDark={isDark} />}
          {activeSection === "thermodynamics" && <ThermodynamicsSection isDark={isDark} />}
          {activeSection === "advanced" && <AdvancedSection isDark={isDark} />}
        </div>
      </main>

      <SiteFooter isDark={isDark} locale={locale} />
    </div>
  )
}
