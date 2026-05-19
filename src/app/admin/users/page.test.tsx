import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AdminUsersPage from "@/app/admin/users/page"
import type { AdminUser } from "@/hooks/api/use-admin-analytics"

interface UsersListData {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const mockUseAdminUsersList = vi.fn()

vi.mock("@/hooks/api/use-admin-analytics", () => ({
  useAdminUsersList: (...args: unknown[]) => mockUseAdminUsersList(...args) as never,
}))

const mockUsers: AdminUser[] = [
  {
    id: "u1", name: "Alice", email: "alice@test.com", role: "USER",
    createdAt: "2026-01-15T00:00:00Z", image: null,
    activityCount: 45, totalXp: 3200, lastActive: "2026-05-18T10:00:00Z",
  },
  {
    id: "u2", name: "Bob", email: "bob@test.com", role: "ADMIN",
    createdAt: "2026-02-01T00:00:00Z", image: null,
    activityCount: 120, totalXp: 8500, lastActive: "2026-05-19T08:00:00Z",
  },
  {
    id: "u3", name: null, email: null, role: "MODERATOR",
    createdAt: "2026-03-10T00:00:00Z", image: null,
    activityCount: 12, totalXp: 900, lastActive: null,
  },
]

const defaultData: UsersListData = {
  users: mockUsers,
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("AdminUsersPage", () => {
  beforeEach(() => {
    mockUseAdminUsersList.mockReturnValue({
      data: defaultData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it("renders user table with all users", () => {
    render(<AdminUsersPage />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "—" })).toBeInTheDocument()

    expect(screen.getByText("alice@test.com")).toBeInTheDocument()
    expect(screen.getByText("bob@test.com")).toBeInTheDocument()

    expect(screen.getByText("USER")).toBeInTheDocument()
    expect(screen.getByText("ADMIN")).toBeInTheDocument()
    expect(screen.getByText("MODERATOR")).toBeInTheDocument()
  })

  it("renders total user count", () => {
    render(<AdminUsersPage />)
    expect(screen.getByText("Users (3)")).toBeInTheDocument()
  })

  it("renders search input with placeholder", () => {
    render(<AdminUsersPage />)
    expect(screen.getByPlaceholderText("Search by name or email...")).toBeInTheDocument()
  })

  it("renders role filter dropdown", () => {
    render(<AdminUsersPage />)
    expect(screen.getByText("All roles")).toBeInTheDocument()
  })

  it("triggers search on Enter key", async () => {
    render(<AdminUsersPage />)
    const user = userEvent.setup()

    const input = screen.getByPlaceholderText("Search by name or email...")
    await user.type(input, "Alice{Enter}")

    expect(mockUseAdminUsersList).toHaveBeenLastCalledWith(1, "Alice", "")
  })

  it("triggers search on button click", async () => {
    render(<AdminUsersPage />)
    const user = userEvent.setup()

    const input = screen.getByPlaceholderText("Search by name or email...")
    await user.type(input, "Bob")

    const searchButton = screen.getAllByRole("button")[0]
    await user.click(searchButton)

    expect(mockUseAdminUsersList).toHaveBeenLastCalledWith(1, "Bob", "")
  })

  it("shows loading skeleton", () => {
    mockUseAdminUsersList.mockReturnValue({
      data: null, isLoading: true, error: null, refetch: vi.fn(),
    })
    const { container } = render(<AdminUsersPage />)
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("shows error state with retry", () => {
    const refetch = vi.fn()
    mockUseAdminUsersList.mockReturnValue({
      data: null, isLoading: false, error: new Error("Failed"), refetch,
    })
    render(<AdminUsersPage />)
    expect(screen.getByText("Failed to load users")).toBeInTheDocument()

    const retryButton = screen.getByRole("button", { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })

  it("renders pagination when multiple pages", () => {
    const multiPageData: UsersListData = {
      ...defaultData,
      total: 25,
      totalPages: 3,
      page: 2,
    }
    mockUseAdminUsersList.mockReturnValue({
      data: multiPageData, isLoading: false, error: null, refetch: vi.fn(),
    })
    render(<AdminUsersPage />)

    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
    expect(screen.getByText("Previous")).toBeInTheDocument()
    expect(screen.getByText("Next")).toBeInTheDocument()
  })

  it("disables Previous on first page", () => {
    const multiPageData: UsersListData = {
      ...defaultData,
      total: 25,
      totalPages: 3,
      page: 1,
    }
    mockUseAdminUsersList.mockReturnValue({
      data: multiPageData, isLoading: false, error: null, refetch: vi.fn(),
    })
    render(<AdminUsersPage />)

    expect(screen.getByText("Previous")).toBeDisabled()
    expect(screen.getByText("Next")).not.toBeDisabled()
  })

  it("disables Next on last page", () => {
    const multiPageData: UsersListData = {
      ...defaultData,
      total: 25,
      totalPages: 3,
      page: 3,
    }
    mockUseAdminUsersList.mockReturnValue({
      data: multiPageData, isLoading: false, error: null, refetch: vi.fn(),
    })
    render(<AdminUsersPage />)

    expect(screen.getByText("Previous")).not.toBeDisabled()
    expect(screen.getByText("Next")).toBeDisabled()
  })

  it("does not show pagination for single page", () => {
    render(<AdminUsersPage />)
    expect(screen.queryByText(/Page/)).not.toBeInTheDocument()
  })

  it("applies correct role badge classes", () => {
    render(<AdminUsersPage />)

    const adminBadge = screen.getByText("ADMIN")
    expect(adminBadge.className).toContain("bg-red-100")

    const modBadge = screen.getByText("MODERATOR")
    expect(modBadge.className).toContain("bg-blue-100")

    const userBadge = screen.getByText("USER")
    expect(userBadge.className).toContain("bg-gray-100")
  })
})
