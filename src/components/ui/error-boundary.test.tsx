import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ErrorBoundary, ErrorBoundaryFallback } from "@/components/ui/error-boundary"

// Mock the logger
vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}))

afterEach(() => {
  cleanup()
})

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>
    )
    expect(screen.getByTestId("child")).toHaveTextContent("Hello")
  })

  it("renders error UI when child throws", () => {
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary name="TestComponent">
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Ошибка: TestComponent/i)).toBeInTheDocument()
    expect(screen.getByText(/Test error/i)).toBeInTheDocument()
  })

  it("shows custom fallback when provided", () => {
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByTestId("custom-fallback")).toHaveTextContent("Custom Error")
  })

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn()
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    const [error] = onError.mock.calls[0] as [Error]
    expect(error.message).toBe("Test error")
  })

  it("has retry and reload buttons in error state", () => {
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByRole("button", { name: /Попробовать снова/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Перезагрузить страницу/i })).toBeInTheDocument()
  })
})

describe("ErrorBoundaryFallback", () => {
  it("renders error message and reset button", () => {
    const error = new Error("Something went wrong")
    const reset = vi.fn()

    render(<ErrorBoundaryFallback error={error} reset={reset} />)

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Попробовать снова/i })).toBeInTheDocument()
  })

  it("shows error digest when available", () => {
    const error = new Error("Error") as Error & { digest?: string }
    error.digest = "abc123"
    const reset = vi.fn()

    render(<ErrorBoundaryFallback error={error} reset={reset} />)

    expect(screen.getByText(/Error ID: abc123/i)).toBeInTheDocument()
  })

  it("calls reset function on button click", async () => {
    const user = userEvent.setup()
    const error = new Error("Error")
    const reset = vi.fn()

    render(<ErrorBoundaryFallback error={error} reset={reset} />)

    await user.click(screen.getByRole("button", { name: /Попробовать снова/i }))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it("shows custom title when provided", () => {
    const error = new Error("Error")
    const reset = vi.fn()

    render(<ErrorBoundaryFallback error={error} reset={reset} title="Custom Title" />)

    expect(screen.getByText(/Custom Title/i)).toBeInTheDocument()
  })
})
