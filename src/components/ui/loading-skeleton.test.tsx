import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import {
  LoadingSkeleton,
  VisualizationCardSkeleton,
  ListSkeleton,
  TableSkeleton,
  ChartSkeleton,
  PageSkeleton,
  FullScreenLoader,
  InlineLoader,
} from "@/components/ui/loading-skeleton"

afterEach(() => {
  cleanup()
})

describe("LoadingSkeleton", () => {
  it("renders with default card variant", () => {
    const { container } = render(<LoadingSkeleton />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass("animate-pulse")
  })

  it("renders with text variant", () => {
    const { container } = render(<LoadingSkeleton variant="text" />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toHaveClass("animate-pulse")
  })

  it("renders with visualization variant", () => {
    const { container } = render(<LoadingSkeleton variant="visualization" />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toHaveClass("rounded-lg")
  })

  it("applies custom className", () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />)
    const skeleton = container.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toHaveClass("custom-class")
  })
})

describe("VisualizationCardSkeleton", () => {
  it("renders visualization skeleton with text and buttons", () => {
    const { container } = render(<VisualizationCardSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(1)
  })
})

describe("ListSkeleton", () => {
  it("renders specified number of items", () => {
    const { container } = render(<ListSkeleton count={3} />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBe(9) // 3 per item (image + 2 text lines)
  })

  it("renders default 5 items", () => {
    const { container } = render(<ListSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBe(15) // 3 per item
  })
})

describe("TableSkeleton", () => {
  it("renders header and rows", () => {
    const { container } = render(<TableSkeleton rows={3} columns={4} />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    // 4 header cells + 3 rows * 4 cells = 16
    expect(skeletons.length).toBe(16)
  })
})

describe("ChartSkeleton", () => {
  it("renders chart layout", () => {
    const { container } = render(<ChartSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(1)
  })
})

describe("PageSkeleton", () => {
  it("renders full page layout", () => {
    const { container } = render(<PageSkeleton />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    // 2 text + 6 visualization cards * multiple skeletons each
    expect(skeletons.length).toBeGreaterThan(10)
  })
})

describe("FullScreenLoader", () => {
  it("renders with default message", () => {
    const { container } = render(<FullScreenLoader />)
    const loader = container.querySelector('[aria-label="Загрузка..."]')
    expect(loader).toBeInTheDocument()
  })

  it("renders custom message", () => {
    const { container } = render(<FullScreenLoader message="Custom loading..." />)
    const loader = container.querySelector('[aria-label="Custom loading..."]')
    expect(loader).toBeInTheDocument()
  })

  it("has correct ARIA attributes", () => {
    const { container } = render(<FullScreenLoader message="Loading data" />)
    const loader = container.querySelector('[role="status"]')
    expect(loader).toHaveAttribute("aria-label", "Loading data")
  })
})

describe("InlineLoader", () => {
  it("renders with default small size", () => {
    const { container } = render(<InlineLoader />)
    const spinner = container.querySelector('[role="status"]')
    expect(spinner).toHaveClass("h-4", "w-4")
  })

  it("renders with medium size", () => {
    const { container } = render(<InlineLoader size="md" />)
    const spinner = container.querySelector('[role="status"]')
    expect(spinner).toHaveClass("h-6", "w-6")
  })

  it("renders with large size", () => {
    const { container } = render(<InlineLoader size="lg" />)
    const spinner = container.querySelector('[role="status"]')
    expect(spinner).toHaveClass("h-8", "w-8")
  })
})
