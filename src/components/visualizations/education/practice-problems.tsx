"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/use-i18n"

interface PracticeProblem {
  id: string
  category: "mechanics" | "electromagnetism" | "quantum" | "relativity"
  difficulty: "easy" | "medium" | "hard"
  question: string
  hint: string
  solution: string
  answer: number
  unit: string
}

const PROBLEMS: PracticeProblem[] = [
  // Mechanics
  {
    id: "m1",
    category: "mechanics",
    difficulty: "easy",
    question: "A ball of mass 2 kg moves at 5 m/s. Calculate its kinetic energy.",
    hint: "Use E = ½mv²",
    solution: "E = ½ × 2 × 5² = ½ × 2 × 25 = 25 J",
    answer: 25,
    unit: "J",
  },
  {
    id: "m2",
    category: "mechanics",
    difficulty: "easy",
    question: "A 10 kg object is lifted to a height of 3 m. What is its potential energy? (g = 9.8 m/s²)",
    hint: "Use E = mgh",
    solution: "E = 10 × 9.8 × 3 = 294 J",
    answer: 294,
    unit: "J",
  },
  {
    id: "m3",
    category: "mechanics",
    difficulty: "medium",
    question: "A force of 50 N is applied at 60° to move an object 10 m. Calculate the work done.",
    hint: "W = F·s·cos(θ), cos(60°) = 0.5",
    solution: "W = 50 × 10 × cos(60°) = 50 × 10 × 0.5 = 250 J",
    answer: 250,
    unit: "J",
  },
  {
    id: "m4",
    category: "mechanics",
    difficulty: "medium",
    question: "A car of mass 1000 kg accelerates from 0 to 20 m/s in 5 s. What is the average force?",
    hint: "F = ma, a = Δv/Δt",
    solution: "a = 20/5 = 4 m/s², F = 1000 × 4 = 4000 N",
    answer: 4000,
    unit: "N",
  },
  {
    id: "m5",
    category: "mechanics",
    difficulty: "hard",
    question: "An object falls from 20 m. What is its velocity just before impact? (g = 9.8 m/s²)",
    hint: "v = √(2gh)",
    solution: "v = √(2 × 9.8 × 20) = √392 ≈ 19.8 m/s",
    answer: 19.8,
    unit: "m/s",
  },
  // Electromagnetism
  {
    id: "e1",
    category: "electromagnetism",
    difficulty: "easy",
    question: "A resistor of 10 Ω has a current of 2 A. What is the voltage across it?",
    hint: "U = IR",
    solution: "U = 2 × 10 = 20 V",
    answer: 20,
    unit: "V",
  },
  {
    id: "e2",
    category: "electromagnetism",
    difficulty: "easy",
    question: "A circuit has voltage 12 V and current 3 A. Calculate the power.",
    hint: "P = UI",
    solution: "P = 12 × 3 = 36 W",
    answer: 36,
    unit: "W",
  },
  {
    id: "e3",
    category: "electromagnetism",
    difficulty: "medium",
    question: "Two charges q₁ = 1 μC and q₂ = 2 μC are 0.1 m apart. Calculate the force. (k = 8.99×10⁹)",
    hint: "F = kq₁q₂/r²",
    solution: "F = 8.99e9 × 1e-6 × 2e-6 / 0.01 = 1.798 N",
    answer: 1.8,
    unit: "N",
  },
  {
    id: "e4",
    category: "electromagnetism",
    difficulty: "hard",
    question: "A capacitor of 100 μF is charged to 12 V. What energy is stored?",
    hint: "E = ½CU²",
    solution: "E = 0.5 × 100e-6 × 144 = 0.0072 J = 7.2 mJ",
    answer: 0.0072,
    unit: "J",
  },
  // Quantum
  {
    id: "q1",
    category: "quantum",
    difficulty: "easy",
    question: "Calculate the energy of a photon with frequency 5×10¹⁴ Hz. (h = 6.626×10⁻³⁴ J·s)",
    hint: "E = hf",
    solution: "E = 6.626e-34 × 5e14 = 3.313e-19 J",
    answer: 3.313e-19,
    unit: "J",
  },
  {
    id: "q2",
    category: "quantum",
    difficulty: "medium",
    question: "What is the energy of an electron in the n = 2 level of hydrogen?",
    hint: "Eₙ = -13.6/n² eV",
    solution: "E₂ = -13.6/4 = -3.4 eV",
    answer: -3.4,
    unit: "eV",
  },
  {
    id: "q3",
    category: "quantum",
    difficulty: "medium",
    question: "An electron (m = 9.11×10⁻³¹ kg) moves at 10⁶ m/s. Find its de Broglie wavelength.",
    hint: "λ = h/mv",
    solution: "λ = 6.626e-34 / (9.11e-31 × 1e6) = 7.27e-10 m",
    answer: 7.27e-10,
    unit: "m",
  },
  {
    id: "q4",
    category: "quantum",
    difficulty: "hard",
    question: "If the position uncertainty is 10⁻¹⁰ m, what is the minimum momentum uncertainty? (ℏ = 1.055×10⁻³⁴ J·s)",
    hint: "Δp ≥ ℏ/(2Δx)",
    solution: "Δp = 1.055e-34 / (2 × 1e-10) = 5.275e-25 kg·m/s",
    answer: 5.275e-25,
    unit: "kg·m/s",
  },
  // Relativity
  {
    id: "r1",
    category: "relativity",
    difficulty: "easy",
    question: "Calculate the Lorentz factor for v = 0.6c.",
    hint: "γ = 1/√(1-v²/c²)",
    solution: "γ = 1/√(1-0.36) = 1/√0.64 = 1/0.8 = 1.25",
    answer: 1.25,
    unit: "",
  },
  {
    id: "r2",
    category: "relativity",
    difficulty: "medium",
    question: "A spaceship travels at 0.8c. If 10 years pass on Earth, how much time passes on the ship?",
    hint: "t' = t/γ, γ = 1/√(1-0.64) = 1/0.6 = 1.667",
    solution: "γ = 1.667, t' = 10/1.667 ≈ 6.0 years",
    answer: 6.0,
    unit: "years",
  },
  {
    id: "r3",
    category: "relativity",
    difficulty: "hard",
    question: "Convert 1 kg of mass to energy. (c = 3×10⁸ m/s)",
    hint: "E = mc²",
    solution: "E = 1 × (3e8)² = 9e16 J",
    answer: 9e16,
    unit: "J",
  },
  {
    id: "r4",
    category: "relativity",
    difficulty: "medium",
    question: "A rod of length 5 m moves at 0.9c. What is its contracted length?",
    hint: "L' = L√(1-v²/c²)",
    solution: "L' = 5 × √(1-0.81) = 5 × √0.19 = 5 × 0.436 = 2.18 m",
    answer: 2.18,
    unit: "m",
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  mechanics: "Mechanics",
  electromagnetism: "Electromagnetism",
  quantum: "Quantum Physics",
  relativity: "Relativity",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-600/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-600/20 text-red-400 border-red-500/30",
}

export function PracticeProblems() {
  const t = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const filtered =
    selectedCategory === "all" ? PROBLEMS : PROBLEMS.filter((p) => p.category === selectedCategory)

  const problem = filtered[currentIndex % filtered.length]

  const handleSubmit = () => {
    const num = parseFloat(userAnswer)
    if (isNaN(num)) return

    const tolerance = Math.abs(problem.answer) * 0.05 // 5% tolerance
    const correct = Math.abs(num - problem.answer) <= tolerance

    setIsCorrect(correct)
    setSubmitted(true)
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filtered.length)
    setUserAnswer("")
    setShowHint(false)
    setShowSolution(false)
    setSubmitted(false)
  }

  const categories = ["all", "mechanics", "electromagnetism", "quantum", "relativity"]

  return (
    <div className="space-y-4">
      {/* Score */}
      {score.total > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            Score: {score.correct}/{score.total}
          </span>
          <span className="text-green-400">
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat)
              setCurrentIndex(0)
              setUserAnswer("")
              setShowHint(false)
              setShowSolution(false)
              setSubmitted(false)
            }}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            className="text-xs"
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {problem && (
        <div className="space-y-4">
          {/* Problem card */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[problem.difficulty]}`}
              >
                {DIFFICULTY_LABELS[problem.difficulty]}
              </span>
              <span className="text-xs text-gray-500">
                {CATEGORY_LABELS[problem.category]}
              </span>
            </div>

            <p className="text-sm font-medium text-white">{problem.question}</p>
          </div>

          {/* Hint */}
          {showHint && !submitted && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3 text-sm text-yellow-300">
              💡 {problem.hint}
            </div>
          )}

          {/* Answer input */}
          {!submitted && (
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Your answer"
              />
              {problem.unit && (
                <span className="flex items-center text-sm text-gray-400">{problem.unit}</span>
              )}
              <Button onClick={handleSubmit} size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                {t("learning.answer") ?? "Submit"}
              </Button>
            </div>
          )}

          {/* Result */}
          {submitted && (
            <div
              className={`rounded-lg border p-3 ${
                isCorrect
                  ? "border-green-500/30 bg-green-900/20"
                  : "border-red-500/30 bg-red-900/20"
              }`}
            >
              <div className={`text-sm font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </div>
              {!isCorrect && (
                <div className="mt-1 text-xs text-gray-400">
                  Correct answer: {problem.answer.toExponential(3)} {problem.unit}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!submitted && (
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
                className="text-xs border-yellow-500/50 text-yellow-300"
              >
                💡 Hint
              </Button>
            )}
            {submitted && (
              <Button
                onClick={() => setShowSolution(!showSolution)}
                variant="outline"
                size="sm"
                className="text-xs border-blue-500/50 text-blue-300"
              >
                📖 Solution
              </Button>
            )}
            {submitted && (
              <Button onClick={handleNext} size="sm" className="bg-purple-600 hover:bg-purple-500">
                Next →
              </Button>
            )}
          </div>

          {/* Solution */}
          {showSolution && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-3 text-sm text-blue-300">
              <div className="mb-1 text-xs font-medium text-blue-400">Solution:</div>
              {problem.solution}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
