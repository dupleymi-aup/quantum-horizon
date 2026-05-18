interface HeroSectionProps {
  isDark: boolean
}

export function HeroSection({ isDark }: HeroSectionProps) {
  return (
    <div className="mt-6 text-center">
      <h1 className="animate-float mb-3 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl lg:text-6xl">
        Quantum Horizon
      </h1>
      <p
        className={`mx-auto max-w-2xl text-sm md:text-base lg:text-lg ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Интерактивные визуализации законов физики
      </p>

      <div className="mx-auto mt-6 flex items-center justify-center gap-2">
        <div
          className={`h-px w-16 ${isDark ? "bg-gradient-to-r from-transparent to-purple-500/50" : "bg-gradient-to-r from-transparent to-purple-400/30"}`}
        />
        <div className="flex gap-1">
          <span className="text-purple-500">⚛️</span>
          <span className="text-blue-500">🌌</span>
          <span className="text-pink-500">🔬</span>
        </div>
        <div
          className={`h-px w-16 ${isDark ? "bg-gradient-to-l from-transparent to-purple-500/50" : "bg-gradient-to-l from-transparent to-purple-400/30"}`}
        />
      </div>
    </div>
  )
}
