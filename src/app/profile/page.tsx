import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/authOptions"
import { ProfileContent } from "./profile-content"

export const metadata: Metadata = {
  title: "Profile — Quantum Horizon",
  description: "View your achievements, badges, learning statistics, and account settings.",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile")
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <ProfileContent session={session} />
    </div>
  )
}
