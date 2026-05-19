import { Metadata } from "next"
import { PhysicsGlossary } from "@/components/visualizations/education/physics-glossary"

export const metadata: Metadata = {
  title: "Physics Glossary — Quantum Horizon",
  description: "Searchable dictionary of physics terms with definitions, formulas, and cross-references.",
}

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PhysicsGlossary />
    </div>
  )
}
