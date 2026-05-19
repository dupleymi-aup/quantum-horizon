import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AdminError } from "@/components/admin/admin-error"

describe("AdminError", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders with default message", () => {
    render(<AdminError />)
    expect(screen.getByText("Failed to load data")).toBeInTheDocument()
    expect(screen.getByText("Check your connection and try again.")).toBeInTheDocument()
  })

  it("renders custom message", () => {
    render(<AdminError message="Custom error" />)
    expect(screen.getByText("Custom error")).toBeInTheDocument()
  })

  it("does not render retry button when onRetry is not provided", () => {
    render(<AdminError />)
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument()
  })

  it("renders retry button and handles click", async () => {
    const handleRetry = vi.fn()
    render(<AdminError onRetry={handleRetry} />)

    const retryButton = screen.getByRole("button", { name: /retry/i })
    expect(retryButton).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(retryButton)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
