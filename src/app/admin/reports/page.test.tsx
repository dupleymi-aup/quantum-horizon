import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import AdminReportsHubPage from "@/app/admin/reports/page"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("AdminReportsHubPage", () => {
  it("renders page title", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Reports Hub")).toBeInTheDocument()
  })

  it("renders description text", () => {
    render(<AdminReportsHubPage />)
    expect(
      screen.getByText(/Generate and export 7 detailed performance reports/)
    ).toBeInTheDocument()
  })

  it("renders all 7 report cards with links", () => {
    render(<AdminReportsHubPage />)
    const links = screen.getAllByRole("link")
    expect(links.length).toBe(7)
  })

  it("has link to student performance report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Student Performance Report")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Student Performance Report/ })).toHaveAttribute(
      "href",
      "/admin/reports/student-performance"
    )
  })

  it("has link to class performance report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Class Performance Report")).toBeInTheDocument()
  })

  it("has link to at-risk report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("At-Risk Student Early Warning")).toBeInTheDocument()
  })

  it("has link to topic mastery report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Topic Mastery Heatmap")).toBeInTheDocument()
  })

  it("has link to group comparison report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Student Group Comparison")).toBeInTheDocument()
  })

  it("has link to engagement & grades report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Engagement & Grade Correlation")).toBeInTheDocument()
  })

  it("has link to learning velocity report", () => {
    render(<AdminReportsHubPage />)
    expect(screen.getByText("Learning Velocity Report")).toBeInTheDocument()
  })
})
