import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/authOptions"
import { AchievementsPanel } from "@/components/user/achievements-panel"

export const metadata: Metadata = {
  title: "Achievements — Quantum Horizon",
  description: "Track your learning achievements, explore progress, and unlock new milestones.",
}

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/achievements")
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Achievements</h1>
      <AchievementsPanel />
    </div>
  )
}
