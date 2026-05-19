import { Metadata } from "next"
import { PhysicsLaboratory } from "@/components/visualizations/education/physics-laboratory"

export const metadata: Metadata = {
  title: "Physics Laboratory — Quantum Horizon",
  description: "Interactive physics experiments with step-by-step procedures, observations, and explanations.",
}

export default function LaboratoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PhysicsLaboratory />
    </div>
  )
}
