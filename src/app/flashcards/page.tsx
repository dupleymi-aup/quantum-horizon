import { Metadata } from "next"
import { PhysicsFlashcards } from "@/components/visualizations/education/physics-flashcards"

export const metadata: Metadata = {
  title: "Physics Flashcards — Quantum Horizon",
  description: "Study physics formulas and concepts with interactive flashcards.",
}

export default function FlashcardsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PhysicsFlashcards />
    </div>
  )
}
