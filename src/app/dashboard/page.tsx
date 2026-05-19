import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/authOptions"
import { DashboardContent } from "./dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard — Quantum Horizon",
  description: "Track your physics learning progress, XP, achievements, and study activity.",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <DashboardContent userName={session.user.name ?? "Explorer"} />
    </div>
  )
}
