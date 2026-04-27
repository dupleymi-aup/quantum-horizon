"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import { VisualizationCanvas } from "../base/visualization-canvas"
import { VisualizationControls } from "../base/visualization-controls"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useVisualizationStore } from "@/stores/visualization-store"

/** Deterministic seeded PRNG (mulberry32) — avoids Math.random() in render */
function seededRandom(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface DarkEnergyVisualizationProps {
  isDark: boolean
}

export function DarkEnergyVisualization({ isDark }: DarkEnergyVisualizationProps) {
  const [expansionRate, setExpansionRate] = useState(0.7)
  const [darkEnergyFraction, setDarkEnergyFraction] = useState(68)
  const [showMatter, setShowMatter] = useState(true)
  const timeRef = useRef(0)

  const isPlaying = useVisualizationStore((state) => state.isPlaying)
  const animationSpeed = useVisualizationStore((state) => state.animationSpeed)
  const { togglePlaying, setAnimationSpeed } = useVisualizationStore()

  // Generate galaxy positions once using deterministic seeded PRNG
  const galaxies = useMemo(() => {
    const rand = seededRandom(42)
    return Array.from({ length: 50 }, () => ({
      angle: rand() * Math.PI * 2,
      distance: 20 + rand() * 100,
      size: 1 + rand() * 2,
      color: `hsl(${String(200 + rand() * 60)}, 70%, ${String(60 + rand() * 30)}%)`,
    }))
  }, [])

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      _isDark: boolean,
      delta: number
    ) => {
      if (isPlaying) {
        timeRef.current += (delta / 1000) * animationSpeed * expansionRate
      }
      const time = timeRef.current
      const centerX = width / 2
      const centerY = height / 2

      // Background - expanding space gradient
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2)
      bgGradient.addColorStop(0, _isDark ? "#0a0020" : "#1a0030")
      bgGradient.addColorStop(0.5, _isDark ? "#050015" : "#0f0020")
      bgGradient.addColorStop(1, _isDark ? "#000005" : "#050010")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Dark energy field visualization
      ctx.globalAlpha = 0.3
      for (let i = 0; i < 20; i++) {
        const radius = (time * 50 + i * 20) % (width / 2)
        const alpha = 1 - radius / (width / 2)
        ctx.strokeStyle = `rgba(138, 43, 226, ${String(alpha * 0.3)})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Draw galaxies accelerating outward
      galaxies.forEach((galaxy) => {
        const acceleratedDistance = galaxy.distance * (1 + time * 0.1 * (darkEnergyFraction / 50))
        const x = centerX + Math.cos(galaxy.angle) * acceleratedDistance
        const y = centerY + Math.sin(galaxy.angle) * acceleratedDistance

        // Galaxy glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, galaxy.size * 3)
        glow.addColorStop(0, galaxy.color)
        glow.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, galaxy.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Galaxy core
        ctx.fillStyle = galaxy.color
        ctx.beginPath()
        ctx.arc(x, y, galaxy.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Matter density visualization
      if (showMatter) {
        ctx.fillStyle = _isDark ? "rgba(255, 200, 100, 0.1)" : "rgba(255, 200, 100, 0.15)"
        for (let i = 0; i < 10; i++) {
          const x = centerX + Math.cos(time * 0.5 + i) * (30 + i * 10)
          const y = centerY + Math.sin(time * 0.5 + i * 1.3) * (30 + i * 10)
          ctx.beginPath()
          ctx.arc(x, y, 5 + Math.sin(time + i) * 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Central marker (observer)
      ctx.strokeStyle = _isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX - 5, centerY)
      ctx.lineTo(centerX + 5, centerY)
      ctx.moveTo(centerX, centerY - 5)
      ctx.lineTo(centerX, centerY + 5)
      ctx.stroke()

      ctx.fillStyle = _isDark ? "#FFFFFF" : "#333333"
      ctx.font = "8px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Наблюдатель", centerX, centerY + 20)

      // Universe composition pie chart
      const pieX = 60
      const pieY = 50
      const pieR = 30

      // Dark energy
      ctx.fillStyle = "#8B00FF"
      ctx.beginPath()
      ctx.moveTo(pieX, pieY)
      ctx.arc(
        pieX,
        pieY,
        pieR,
        -Math.PI / 2,
        -Math.PI / 2 + (darkEnergyFraction / 100) * Math.PI * 2
      )
      ctx.closePath()
      ctx.fill()

      // Dark matter
      ctx.fillStyle = "#4B0082"
      ctx.beginPath()
      ctx.moveTo(pieX, pieY)
      ctx.arc(
        pieX,
        pieY,
        pieR,
        -Math.PI / 2 + (darkEnergyFraction / 100) * Math.PI * 2,
        -Math.PI / 2 + 0.95 * Math.PI * 2
      )
      ctx.closePath()
      ctx.fill()

      // Normal matter
      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.moveTo(pieX, pieY)
      ctx.arc(pieX, pieY, pieR, -Math.PI / 2 + 0.95 * Math.PI * 2, -Math.PI / 2 + Math.PI * 2)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = _isDark ? "#FFF" : "#333"
      ctx.font = "7px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Ω_Λ = ${String(darkEnergyFraction)}%`, 95, 40)
      ctx.fillText("Ω_dm = 27%", 95, 52)
      ctx.fillText("Ω_m = 5%", 95, 64)

      // Info panel
      ctx.fillStyle = _isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.85)"
      ctx.fillRect(width - 130, height - 45, 125, 40)
      ctx.fillStyle = _isDark ? "#AAAAAA" : "#555555"
      ctx.font = "8px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`H₀ ≈ 70 км/с/Мпк`, width - 125, height - 30)
      ctx.fillText(
        `Ускорение: +${String(Math.round(expansionRate * 100))}%`,
        width - 125,
        height - 18
      )
    },
    [isPlaying, animationSpeed, expansionRate, darkEnergyFraction, showMatter, galaxies]
  )

  return (
    <div className="space-y-3">
      <VisualizationCanvas
        draw={draw}
        isDark={isDark}
        className="h-56 w-full rounded-lg"
        ariaLabel="Тёмная энергия: ускоренное расширение Вселенной"
      />
      <VisualizationControls
        isPlaying={isPlaying}
        animationSpeed={animationSpeed}
        onTogglePlay={togglePlaying}
        onSpeedChange={setAnimationSpeed}
        isDark={isDark}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-purple-400">Тёмная энергия %</span>
            <span className={isDark ? "font-mono text-white" : "font-mono text-gray-900"}>
              {darkEnergyFraction}%
            </span>
          </div>
          <Slider
            value={[darkEnergyFraction]}
            onValueChange={(v) => {
              setDarkEnergyFraction(v[0])
            }}
            min={50}
            max={80}
            step={1}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-blue-400">Расширение H</span>
            <span className={isDark ? "font-mono text-white" : "font-mono text-gray-900"}>
              {expansionRate.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[expansionRate]}
            onValueChange={(v) => {
              setExpansionRate(v[0])
            }}
            min={0.1}
            max={2}
            step={0.1}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setShowMatter(!showMatter)
          }}
          variant={showMatter ? "default" : "outline"}
          size="sm"
          className="text-xs"
        >
          🌟 Материя
        </Button>
      </div>
      <div className="rounded-lg border border-purple-500/20 bg-purple-900/20 p-3 text-xs">
        <div className="mb-1 font-semibold text-purple-300">💫 Тёмная энергия</div>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Загадочная сила, составляющая ~68% Вселенной и вызывающая ускоренное расширение. Открыта в
          1998 г. (Нобелевская премия 2011). Природа неизвестна — возможно, энергия вакуума или
          модификация гравитации.
        </p>
        <p className="mt-1 text-cyan-400">Без неё галактики разбегались бы медленнее!</p>
      </div>
    </div>
  )
}
