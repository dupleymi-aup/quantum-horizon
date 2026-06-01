import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminStudentPerformanceReportPage from "@/app/admin/reports/student-performance/page"
import type { StudentPerformanceReport } from "@/hooks/api/use-admin-reports"
import type { AdminUser } from "@/hooks/api/use-admin-analytics"

const mockUseStudentPerformanceReport = vi.fn()
const mockUseAdminUsersList = vi.fn()

vi.mock("@/hooks/api/use-admin-reports", () => ({
  useStudentPerformanceReport: (...args: unknown[]) =>
    mockUseStudentPerformanceReport(...args) as never,
}))

vi.mock("@/hooks/api/use-admin-analytics", () => ({
  useAdminUsersList: (...args: unknown[]) => mockUseAdminUsersList(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">
      <span data-testid="stat-label">{label}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  ),
  GradeTrendLineChart: () => <div data-testid="trend-chart" />,
}))

const mockReport: StudentPerformanceReport = {
  student: {
    id: "u1",
    name: "Test Student",
    email: "test@example.com",
    registeredAt: "2026-01-01",
  },
  overall: {
    avgScore: 75,
    bestScore: 95,
    worstScore: 40,
    totalTaken: 10,
    totalXp: 150,
    activityCount: 25,
    overallMastery: "proficient",
  },
  timeline: [{ date: "2026-05-01", score: 75, topic: "quantum", assessment: "Quiz 1" }],
  byTopic: [
    {
      topic: "quantum_mechanics",
      firstScore: 60,
      latestScore: 80,
      improvement: 20,
      avgScore: 70,
      assessmentsTaken: 5,
      mastery: "proficient",
      classAvg: 65,
      vsClassAvg: 5,
    },
    {
      topic: "relativity",
      firstScore: 50,
      latestScore: 70,
      improvement: 20,
      avgScore: 60,
      assessmentsTaken: 3,
      mastery: "developing",
      classAvg: 70,
      vsClassAvg: -10,
    },
  ],
  classPercentile: 72,
  weakestTopic: { topic: "relativity", avgScore: 60, mastery: "developing" },
  strongestTopic: { topic: "quantum_mechanics", avgScore: 70, mastery: "proficient" },
  trendDirection: "improving",
}

const mockUsers = {
  users: [{ id: "u1", name: "Test Student", email: "test@example.com" }] as AdminUser[],
  total: 1,
  page: 1,
  perPage: 10,
  totalPages: 1,
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminStudentPerformanceReportPage", () => {
  beforeEach(() => {
    mockUseStudentPerformanceReport.mockReturnValue({
      data: mockReport,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseAdminUsersList.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders page title", () => {
    render(<AdminStudentPerformanceReportPage />)
    expect(screen.getByText("Student Performance Report")).toBeInTheDocument()
  })

  it("renders export button", () => {
    render(<AdminStudentPerformanceReportPage />)
    expect(screen.getByRole("button", { name: /Export CSV/ })).toBeInTheDocument()
  })

  it("renders student info when selected", () => {
    render(<AdminStudentPerformanceReportPage />)
    expect(screen.getByText("Test Student")).toBeInTheDocument()
  })

  it("shows error state", () => {
    mockUseStudentPerformanceReport.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed"),
      refetch: vi.fn(),
    })
    mockUseAdminUsersList.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<AdminStudentPerformanceReportPage />)
    expect(screen.getByText("Failed to load student performance report")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })
})
