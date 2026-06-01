import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminTopicMasteryReportPage from "@/app/admin/reports/topic-mastery/page"
import type { TopicMasteryReport } from "@/hooks/api/use-admin-reports"

const mockUseTopicMasteryReport = vi.fn()

vi.mock("@/hooks/api/use-admin-reports", () => ({
  useTopicMasteryReport: (...args: unknown[]) => mockUseTopicMasteryReport(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  HeatmapTable: () => <div data-testid="heatmap-table" />,
  GradeTrendLineChart: () => <div data-testid="trend-chart" />,
  GradeDistributionChart: () => <div data-testid="dist-chart" />,
}))

const mockData: TopicMasteryReport = {
  topics: [
    {
      topic: "quantum",
      avgScore: 75,
      passRate: 80,
      totalStudents: 20,
      masteryDistribution: { advanced: 5, proficient: 10, developing: 3, beginner: 2 },
      trend: [
        { date: "2026-05-01", avgScore: 72 },
        { date: "2026-05-08", avgScore: 75 },
      ],
      weakestAssessments: [{ title: "Quantum Quiz 1", avgScore: 70 }],
    },
    {
      topic: "relativity",
      avgScore: 65,
      passRate: 70,
      totalStudents: 15,
      masteryDistribution: { advanced: 2, proficient: 5, developing: 5, beginner: 3 },
      trend: [
        { date: "2026-05-01", avgScore: 60 },
        { date: "2026-05-08", avgScore: 65 },
      ],
      weakestAssessments: [{ title: "Relativity Quiz 1", avgScore: 60 }],
    },
  ],
  overallMasteryDistribution: { advanced: 10, proficient: 20, developing: 15, beginner: 5 },
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminTopicMasteryReportPage", () => {
  beforeEach(() => {
    mockUseTopicMasteryReport.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders page title", () => {
    render(<AdminTopicMasteryReportPage />)
    expect(screen.getByText("Topic Mastery Heatmap")).toBeInTheDocument()
  })

  it("renders export button", () => {
    render(<AdminTopicMasteryReportPage />)
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument()
  })

  it("renders heatmap table", () => {
    render(<AdminTopicMasteryReportPage />)
    expect(screen.getByTestId("heatmap-table")).toBeInTheDocument()
  })

  it("renders topic data", () => {
    render(<AdminTopicMasteryReportPage />)
    expect(screen.getByText("quantum")).toBeInTheDocument()
    expect(screen.getByText("relativity")).toBeInTheDocument()
  })

  it("shows error state", () => {
    mockUseTopicMasteryReport.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch: vi.fn(),
    })
    render(<AdminTopicMasteryReportPage />)
    expect(screen.getByText("Failed to load topic mastery report")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockUseTopicMasteryReport.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<AdminTopicMasteryReportPage />)
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })
})
