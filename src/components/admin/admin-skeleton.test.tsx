import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import {
  AdminStatCardSkeleton,
  AdminChartSkeleton,
  AdminTableSkeleton,
} from "@/components/admin/admin-skeleton"

afterEach(() => {
  cleanup()
})

describe("AdminStatCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<AdminStatCardSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })
})

describe("AdminChartSkeleton", () => {
  it("renders without title by default", () => {
    const { container } = render(<AdminChartSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBe(1)
  })

  it("renders with title when provided", () => {
    const { container } = render(<AdminChartSkeleton title="Chart Title" />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBe(2)
  })
})

describe("AdminTableSkeleton", () => {
  it("renders default 5 rows", () => {
    const { container } = render(<AdminTableSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    // 1 header + 5 rows * 4 columns = 21
    expect(skeletons.length).toBe(21)
  })

  it("renders custom number of rows", () => {
    const { container } = render(<AdminTableSkeleton rows={3} />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    // 1 header + 3 rows * 4 columns = 13
    expect(skeletons.length).toBe(13)
  })
})
