import { type Session } from "next-auth"

export type AdminRole = "ADMIN" | "MODERATOR"
export type TeacherRole = "TEACHER"
export type StudentRole = "USER"

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

// eslint-disable-next-line @typescript-eslint/require-await
export async function requireAdminRole(session: Session | null): Promise<AuthGuardResult> {
  if (!session?.user.id) {
    return { error: "Unauthorized", status: 401 }
  }
  const role = session.user.role
  if (role !== "ADMIN" && role !== "MODERATOR") {
    return { error: "Forbidden", status: 403 }
  }
  return { userId: session.user.id, role }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function requireTeacherRole(session: Session | null): Promise<AuthGuardResult> {
  if (!session?.user.id) {
    return { error: "Unauthorized", status: 401 }
  }
  const role = session.user.role
  if (role !== "ADMIN" && role !== "MODERATOR" && role !== "TEACHER") {
    return { error: "Forbidden", status: 403 }
  }
  return { userId: session.user.id, role }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function requireAnyRole(session: Session | null): Promise<AuthGuardResult> {
  if (!session?.user.id) {
    return { error: "Unauthorized", status: 401 }
  }
  return { userId: session.user.id, role: session.user.role ?? "USER" }
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "MODERATOR"
}

export function isTeacher(role: string): boolean {
  return role === "TEACHER" || isAdmin(role)
}

export function isStudent(role: string): boolean {
  return role === "USER"
}
