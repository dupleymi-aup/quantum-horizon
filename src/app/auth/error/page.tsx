import { Metadata } from "next"
import AuthErrorClient from "./auth-error-client"

export const metadata: Metadata = {
  title: "Authentication Error — Quantum Horizon",
  description: "An error occurred during authentication. Please try again.",
}

export default function AuthErrorPage() {
  return <AuthErrorClient />
}
