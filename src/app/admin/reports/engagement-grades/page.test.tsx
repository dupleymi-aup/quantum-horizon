import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminEngagementGradeReportPage from "@/app/admin/reports/engagement-grades/page"
import type { EngagementGradeCorrelation } from "@/hooks/api/use-admin-reports"

const mockUseEngagementGradeCorrelation = vi.fn()

vi.mock("@/hooks/api/use-admin-reports", () => ({
  useEngagementGradeCorrelation: (...args: unknown[]) =>
    mockUseEngagementGradeCorrelation(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  ScatterChartComponent: () => <div data-testid="scatter-chart" />,
}))

const mockData: EngagementGradeCorrelation = {
  scatterData: [
    {
      userId: "1",
      name: "Alice",
      activityCount: 50,
      totalSessionMinutes: 300,
      totalXp: 200,
      avgGrade: 85,
      assessmentCount: 10,
    },
    {
      userId: "2",
      name: "Bob",
      activityCount: 10,
      totalSessionMinutes: 60,
      totalXp: 30,
      avgGrade: 45,
      assessmentCount: 3,
    },
  ],
  quadrants: {
    highEngagementHighGrade: [{ userId: "3", name: "Charlie", avgGrade: 88, activityCount: 45 }],
    highEngagementLowGrade: [{ userId: "4", name: "Diana", avgGrade: 55, activityCount: 40 }],
    lowEngagementHighGrade: [{ userId: "5", name: "Eve", avgGrade: 90, activityCount: 5 }],
    lowEngagementLowGrade: [{ userId: "6", name: "Frank", avgGrade: 40, activityCount: 3 }],
  },
  correlation: {
    activityGradeCorrelation: 0.72,
    sessionGradeCorrelation: 0.65,
  },
  summary: {
    totalStudents: 18,
    avgActivityCount: 25,
    avgGrade: 72,
  },
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminEngagementGradeReportPage", () => {
  beforeEach(() => {
    mockUseEngagementGradeCorrelation.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders page title", () => {
    render(<AdminEngagementGradeReportPage />)
    expect(screen.getByText("Engagement & Grade Correlation")).toBeInTheDocument()
  })

  it("renders export button", () => {
    render(<AdminEngagementGradeReportPage />)
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument()
  })

  it("renders scatter chart", () => {
    render(<AdminEngagementGradeReportPage />)
    expect(screen.getByTestId("scatter-chart")).toBeInTheDocument()
  })

  it("renders student data", () => {
    render(<AdminEngagementGradeReportPage />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("shows quadrant labels", () => {
    render(<AdminEngagementGradeReportPage />)
    expect(screen.getByText("High Engagement / High Grades")).toBeInTheDocument()
  })

  it("shows error state", () => {
    mockUseEngagementGradeCorrelation.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch: vi.fn(),
    })
    render(<AdminEngagementGradeReportPage />)
    expect(
      screen.getByText("Failed to load engagement-grade correlation report")
    ).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockUseEngagementGradeCorrelation.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<AdminEngagementGradeReportPage />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })
})
