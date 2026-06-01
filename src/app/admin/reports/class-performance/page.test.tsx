import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminClassPerformanceReportPage from "@/app/admin/reports/class-performance/page"
import type { ClassPerformanceReport } from "@/hooks/api/use-admin-reports"

const mockUseClassPerformanceReport = vi.fn()

vi.mock("@/hooks/api/use-admin-reports", () => ({
  useClassPerformanceReport: (...args: unknown[]) =>
    mockUseClassPerformanceReport(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span data-testid="stat-label">{label}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  ),
  GradeTrendLineChart: () => <div data-testid="trend-chart" />,
  GradeDistributionChart: () => <div data-testid="dist-chart" />,
}))

const mockData: ClassPerformanceReport = {
  totalStudents: 30,
  gradedStudentCount: 25,
  overall: { avgScore: 72, minScore: 30, maxScore: 98, totalGrades: 120, passRate: 80 },
  gradeDistribution: [
    { range: "90-100%", count: 8 },
    { range: "80-89%", count: 12 },
  ],
  byTopic: [{ topic: "quantum", avgScore: 75, totalAttempts: 50, passRate: 80 }],
  topStudents: [{ userId: "u1", name: "Alice", avgScore: 95, assessmentsTaken: 15 }],
  bottomStudents: [{ userId: "u2", name: "Bob", avgScore: 40, assessmentsTaken: 3 }],
  mostDifficultAssessments: [{ title: "Hard Quiz", topic: "quantum", avgScore: 45, attempts: 20 }],
  trendsOverTime: [{ date: "2026-05-01", avgScore: 70, totalGrades: 10 }],
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminClassPerformanceReportPage", () => {
  beforeEach(() => {
    mockUseClassPerformanceReport.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders page title", () => {
    render(<AdminClassPerformanceReportPage />)
    expect(screen.getByText("Class Performance Report")).toBeInTheDocument()
  })

  it("renders export button", () => {
    render(<AdminClassPerformanceReportPage />)
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument()
  })

  it("renders stat cards", () => {
    render(<AdminClassPerformanceReportPage />)
    const cards = screen.getAllByTestId("stat-card")
    expect(cards.length).toBe(4)
  })

  it("renders top and bottom students tables", () => {
    render(<AdminClassPerformanceReportPage />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("shows error state", () => {
    mockUseClassPerformanceReport.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch: vi.fn(),
    })
    render(<AdminClassPerformanceReportPage />)
    expect(screen.getByText("Failed to load class performance report")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockUseClassPerformanceReport.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<AdminClassPerformanceReportPage />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })
})
