import { Metadata } from "next"
import { PeriodicTable } from "@/components/visualizations/education/periodic-table"

export const metadata: Metadata = {
  title: "Periodic Table — Quantum Horizon",
  description: "Interactive periodic table with quantum properties, electron configurations, and orbital diagrams.",
}

export default function PeriodicTablePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PeriodicTable />
    </div>
  )
}
