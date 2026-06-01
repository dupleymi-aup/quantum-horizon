import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AdminGradesPage from "@/app/admin/grades/page"
import { type GradesOverviewData } from "@/hooks/api/use-admin-analytics"

const mockUseAdminGradesOverview = vi.fn()

vi.mock("@/hooks/api/use-admin-analytics", () => ({
  useAdminGradesOverview: (...args: unknown[]) => mockUseAdminGradesOverview(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  GradeTrendLineChart: () => <div data-testid="grade-trend-chart" />,
  GradeDistributionChart: () => <div data-testid="grade-distribution-chart" />,
  ProgressBarChart: () => <div data-testid="progress-bar-chart" />,
}))

const mockData: GradesOverviewData = {
  totalAssessments: 10,
  totalGrades: 45,
  avgScorePercentage: 72,
  passRate: 80,
  trendsOverTime: [
    { date: "2026-05-01", avgScore: 70 },
    { date: "2026-05-02", avgScore: 75 },
  ],
  gradeDistribution: [
    { range: "90-100%", count: 5 },
    { range: "80-89%", count: 10 },
  ],
  avgByTopic: [
    { topic: "quantum", avgScore: 85, count: 15 },
    { topic: "relativity", avgScore: 65, count: 10 },
  ],
  assessmentDifficulty: [
    { title: "Quantum Quiz", topic: "quantum", avgScore: 85, count: 20, stdDev: 8 },
    { title: "Relativity Test", topic: "relativity", avgScore: 55, count: 15, stdDev: 12 },
    { title: "Cosmos Final", topic: "cosmos", avgScore: 92, count: 10, stdDev: 5 },
  ],
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminGradesPage", () => {
  beforeEach(() => {
    mockUseAdminGradesOverview.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders stat cards with correct values", () => {
    render(<AdminGradesPage />)
    const cards = screen.getAllByTestId("stat-card")
    expect(cards.length).toBe(4)
    expect(screen.getByText("Total Assessments")).toBeInTheDocument()
    expect(screen.getByText("Total Grades")).toBeInTheDocument()
    expect(screen.getByText("Average Score")).toBeInTheDocument()
    expect(screen.getByText("Pass Rate")).toBeInTheDocument()
  })

  it("renders chart components", () => {
    render(<AdminGradesPage />)
    expect(screen.getByTestId("grade-trend-chart")).toBeInTheDocument()
    expect(screen.getByTestId("grade-distribution-chart")).toBeInTheDocument()
    expect(screen.getByTestId("progress-bar-chart")).toBeInTheDocument()
  })

  it("renders assessment difficulty table", () => {
    render(<AdminGradesPage />)
    expect(screen.getByText("Quantum Quiz")).toBeInTheDocument()
    expect(screen.getByText("Relativity Test")).toBeInTheDocument()
    expect(screen.getByText("Cosmos Final")).toBeInTheDocument()

    expect(screen.getByText("85%")).toBeInTheDocument()
    expect(screen.getByText("55%")).toBeInTheDocument()
    expect(screen.getByText("92%")).toBeInTheDocument()
  })

  it("sorts by default column (avgScore ascending)", () => {
    render(<AdminGradesPage />)
    const rows = screen.getAllByRole("row")
    // header + 3 data rows
    expect(rows.length).toBe(4)
    // Default sort: avgScore asc -> Relativity Test (55) first
    const cells = rows[1].querySelectorAll("td")
    expect(cells[0]).toHaveTextContent("Relativity Test")
  })

  it("sorts by title on header click", async () => {
    render(<AdminGradesPage />)
    const user = userEvent.setup()

    const headers = screen.getAllByRole("columnheader")
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const assessmentHeader = headers.find((h) => h.textContent?.startsWith("Assessment"))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await user.click(assessmentHeader!)

    const rows = screen.getAllByRole("row")
    const cells = rows[1].querySelectorAll("td")
    expect(cells[0]).toHaveTextContent("Cosmos Final")
  })

  it("toggles sort direction on double click", async () => {
    render(<AdminGradesPage />)
    const user = userEvent.setup()

    const headers = screen.getAllByRole("columnheader")
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const assessmentHeader = headers.find((h) => h.textContent?.startsWith("Assessment"))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await user.click(assessmentHeader!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await user.click(assessmentHeader!)

    const rows = screen.getAllByRole("row")
    const cells = rows[1].querySelectorAll("td")
    expect(cells[0]).toHaveTextContent("Relativity Test")
  })

  it("shows loading state", () => {
    mockUseAdminGradesOverview.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<AdminGradesPage />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state with retry", () => {
    const refetch = vi.fn()
    mockUseAdminGradesOverview.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch,
    })
    render(<AdminGradesPage />)
    expect(screen.getByText("Failed to load grade analytics")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("shows sort indicators on active column", () => {
    render(<AdminGradesPage />)
    const avgScoreHeader = screen.getAllByText(/Avg Score/)
    expect(avgScoreHeader[0].textContent).toContain("▲")
  })
})
