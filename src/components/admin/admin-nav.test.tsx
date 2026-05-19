import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { AdminNav } from "@/components/admin/admin-nav"

const mockUsePathname = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname() as string,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminNav", () => {
  it("renders all navigation links", () => {
    mockUsePathname.mockReturnValue("/admin")
    render(<AdminNav />)

    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("Activity")).toBeInTheDocument()
    expect(screen.getByText("Progress")).toBeInTheDocument()
    expect(screen.getByText("Engagement")).toBeInTheDocument()
    expect(screen.getByText("Performance")).toBeInTheDocument()
    expect(screen.getByText("Compare")).toBeInTheDocument()
    expect(screen.getByText("Insights")).toBeInTheDocument()
    expect(screen.getByText("Grades")).toBeInTheDocument()
    expect(screen.getByText("Grade Trends")).toBeInTheDocument()
    expect(screen.getByText("Student Grades")).toBeInTheDocument()
    expect(screen.getByText("Groups")).toBeInTheDocument()
    expect(screen.getByText("Reports")).toBeInTheDocument()
    expect(screen.getByText("Users")).toBeInTheDocument()
  })

  it("highlights active link for /admin", () => {
    mockUsePathname.mockReturnValue("/admin")
    render(<AdminNav />)

    const overviewLink = screen.getByText("Overview").closest("a")
    expect(overviewLink).toHaveClass("bg-primary", "text-primary-foreground")
  })

  it("highlights active link for nested routes", () => {
    mockUsePathname.mockReturnValue("/admin/users")
    render(<AdminNav />)

    const usersLink = screen.getByText("Users").closest("a")
    expect(usersLink).toHaveClass("bg-primary", "text-primary-foreground")

    const overviewLink = screen.getByText("Overview").closest("a")
    expect(overviewLink).not.toHaveClass("bg-primary")
  })

  it("does not highlight /admin for /admin-users paths", () => {
    mockUsePathname.mockReturnValue("/admin/grades/student")
    render(<AdminNav />)

    const gradesLink = screen.getByText("Grades").closest("a")
    expect(gradesLink).not.toHaveClass("bg-primary")

    const studentGradesLink = screen.getByText("Student Grades").closest("a")
    expect(studentGradesLink).toHaveClass("bg-primary")
  })
})
