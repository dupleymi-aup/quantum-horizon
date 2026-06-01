import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminAtRiskReportPage from "@/app/admin/reports/at-risk/page"
import type { AtRiskReport } from "@/hooks/api/use-admin-reports"

const mockUseAtRiskReport = vi.fn()

vi.mock("@/hooks/api/use-admin-reports", () => ({
  useAtRiskReport: (...args: unknown[]) => mockUseAtRiskReport(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span data-testid="stat-label">{label}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  ),
}))

const mockData: AtRiskReport = {
  atRiskStudents: [
    {
      userId: "u1",
      name: "John Doe",
      email: "john@example.com",
      avgScore: 45,
      trendDirection: "declining",
      masteryLevel: "beginner",
      daysSinceLastActivity: 20,
      riskScore: 85,
      riskFactors: ["declining_grades", "inactive_14d", "low_mastery"],
      lastGradeDate: "2024-01-15",
      totalAssessments: 12,
      weakestTopic: "quantum_mechanics",
    },
    {
      userId: "u2",
      name: "Jane Smith",
      email: "jane@example.com",
      avgScore: 60,
      trendDirection: "stable",
      masteryLevel: "developing",
      daysSinceLastActivity: 5,
      riskScore: 50,
      riskFactors: ["low_mastery"],
      lastGradeDate: "2024-02-01",
      totalAssessments: 8,
      weakestTopic: "relativity",
    },
  ],
  summary: {
    totalAtRisk: 2,
    criticalCount: 1,
    warningCount: 1,
    infoCount: 0,
    mostCommonRiskFactor: "low_mastery",
  },
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminAtRiskReportPage", () => {
  beforeEach(() => {
    mockUseAtRiskReport.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders page title", () => {
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("At-Risk Student Early Warning")).toBeInTheDocument()
  })

  it("renders export CSV button", () => {
    render(<AdminAtRiskReportPage />)
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument()
  })

  it("renders 4 stat cards", () => {
    render(<AdminAtRiskReportPage />)
    const cards = screen.getAllByTestId("stat-card")
    expect(cards.length).toBe(4)
    expect(screen.getByText("Total At-Risk")).toBeInTheDocument()
    expect(screen.getByText("Critical")).toBeInTheDocument()
    expect(screen.getByText("Declining Trend")).toBeInTheDocument()
    expect(screen.getByText("Inactive 14+ Days")).toBeInTheDocument()
  })

  it("renders most common risk factor card", () => {
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("Most Common Risk Factor")).toBeInTheDocument()
    expect(screen.getByText("Low Mastery")).toBeInTheDocument()
  })

  it("renders student table with data", () => {
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("Jane Smith")).toBeInTheDocument()
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
  })

  it("shows table headers", () => {
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("Student")).toBeInTheDocument()
    expect(screen.getByText("Avg Score")).toBeInTheDocument()
    expect(screen.getByText("Trend")).toBeInTheDocument()
    expect(screen.getByText("Mastery")).toBeInTheDocument()
    expect(screen.getByText("Risk Score")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockUseAtRiskReport.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<AdminAtRiskReportPage />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state with retry", () => {
    const refetch = vi.fn()
    mockUseAtRiskReport.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch,
    })
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("Failed to load at-risk report")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("shows empty state when no at-risk students", () => {
    mockUseAtRiskReport.mockReturnValue({
      data: {
        atRiskStudents: [],
        summary: {
          totalAtRisk: 0,
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
          mostCommonRiskFactor: null,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<AdminAtRiskReportPage />)
    expect(screen.getByText("No at-risk students identified")).toBeInTheDocument()
  })
})
