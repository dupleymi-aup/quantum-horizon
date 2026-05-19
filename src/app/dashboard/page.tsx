import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/authOptions"
import { UserProfile } from "@/components/user/user-profile"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <UserProfile />
    </div>
  )
}
