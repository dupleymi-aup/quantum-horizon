import { type Session } from "next-auth"

export type AdminRole = "ADMIN" | "MODERATOR"

export interface AuthCheckResult {
  error: string
  status: number
}

export interface AuthSuccessResult {
  userId: string
  role: string
}

export type AuthGuardResult = AuthCheckResult | AuthSuccessResult

export function isAuthError(result: AuthGuardResult): result is AuthCheckResult {
  return "error" in result
}

export async function requireAdminRole(
  session: Session | null
): Promise<AuthGuardResult> {
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }
  const role = session.user.role
  if (role !== "ADMIN" && role !== "MODERATOR") {
    return { error: "Forbidden", status: 403 }
  }
  return { userId: session.user.id, role }
}
