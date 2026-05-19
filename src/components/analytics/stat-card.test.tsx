import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { Users } from "lucide-react"
import { StatCard } from "@/components/analytics/stat-card"

afterEach(() => {
  cleanup()
})

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard icon={Users} label="Total Users" value="1234" />)
    expect(screen.getByText("Total Users")).toBeInTheDocument()
    expect(screen.getByText("1234")).toBeInTheDocument()
  })

  it("renders numeric value", () => {
    render(<StatCard icon={Users} label="Users" value={42} />)
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders positive trend", () => {
    render(<StatCard icon={Users} label="Users" value="100" trend={{ value: 12, positive: true }} />)
    expect(screen.getByText("+12%")).toBeInTheDocument()
    expect(screen.getByText("+12%")).toHaveClass("text-green-600")
  })

  it("renders negative trend", () => {
    render(<StatCard icon={Users} label="Users" value="100" trend={{ value: -5, positive: false }} />)
    expect(screen.getByText("-5%")).toBeInTheDocument()
    expect(screen.getByText("-5%")).toHaveClass("text-red-600")
  })

  it("does not render trend when not provided", () => {
    render(<StatCard icon={Users} label="Users" value="100" />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
