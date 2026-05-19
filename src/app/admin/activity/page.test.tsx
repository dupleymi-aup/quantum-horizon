import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import AdminActivityPage from "@/app/admin/activity/page"

const mockUseAdminActivityAnalytics = vi.fn()

vi.mock("@/hooks/api/use-admin-analytics", () => ({
  useAdminActivityAnalytics: (...args: unknown[]) => mockUseAdminActivityAnalytics(...args) as never,
}))

vi.mock("@/components/analytics", () => ({
  ActivityLineChart: ({ title }: { title: string }) => <div data-testid="activity-line-chart" data-title={title} />,
}))

const mockData: ActivityData = {
  dailyData: [
    { date: "2026-05-18", count: 25 },
    { date: "2026-05-19", count: 32 },
  ],
  topicBreakdown: [
    { topic: "quantum", count: 45 },
    { topic: "relativity", count: 30 },
    { topic: "cosmos", count: 20 },
  ],
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminActivityPage", () => {
  beforeEach(() => {
    mockUseAdminActivityAnalytics.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders period tabs", () => {
    render(<AdminActivityPage />)
    expect(screen.getByText("7 Days")).toBeInTheDocument()
    expect(screen.getByText("30 Days")).toBeInTheDocument()
    expect(screen.getByText("90 Days")).toBeInTheDocument()
  })

  it("renders activity line chart with default period", () => {
    render(<AdminActivityPage />)
    const chart = screen.getByTestId("activity-line-chart")
    expect(chart).toBeInTheDocument()
    expect(chart).toHaveAttribute("data-title", "Activity — Last 30d")
  })

  it("renders topic breakdown table", () => {
    render(<AdminActivityPage />)
    expect(screen.getByText("Activity by Topic")).toBeInTheDocument()
    expect(screen.getByText("quantum")).toBeInTheDocument()
    expect(screen.getByText("relativity")).toBeInTheDocument()
    expect(screen.getByText("cosmos")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    mockUseAdminActivityAnalytics.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: vi.fn(),
    })
    const { container } = render(<AdminActivityPage />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state with retry", () => {
    const refetch = vi.fn()
    mockUseAdminActivityAnalytics.mockReturnValue({
      data: null, isLoading: false, error: new Error("Failed"), refetch,
    })
    render(<AdminActivityPage />)
    expect(screen.getByText("Failed to load activity data")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("hides topic breakdown when empty", () => {
    mockUseAdminActivityAnalytics.mockReturnValue({
      data: { dailyData: [], topicBreakdown: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<AdminActivityPage />)
    expect(screen.queryByText("Activity by Topic")).not.toBeInTheDocument()
  })
})
