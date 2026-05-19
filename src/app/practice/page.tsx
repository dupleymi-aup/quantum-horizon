import { Metadata } from "next"
import { PracticeProblems } from "@/components/visualizations/education/practice-problems"

export const metadata: Metadata = {
  title: "Practice Problems — Quantum Horizon",
  description: "Solve physics problems in mechanics, electromagnetism, quantum mechanics, and relativity.",
}

export default function PracticeProblemsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PracticeProblems />
    </div>
  )
}
