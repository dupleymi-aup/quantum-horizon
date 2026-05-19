import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/authOptions"
import { ReactQueryProvider } from "@/components/providers/react-query-provider"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  const role = session.user.role
  if (role !== "ADMIN" && role !== "MODERATOR") {
    redirect("/")
  }

  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Student performance analytics and reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4">
          <AdminNav />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-12">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </ReactQueryProvider>
  )
}
