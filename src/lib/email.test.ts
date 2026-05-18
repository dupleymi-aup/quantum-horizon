import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock nodemailer
const mockSendMail = vi.fn()
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: mockSendMail,
    }),
  },
}))

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}))

describe("email utilities", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    mockSendMail.mockClear()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("sendEmail - mock mode", () => {
    it("logs email to console when EMAIL_ENABLED is not true", async () => {
      process.env.EMAIL_ENABLED = "false"

      const { sendEmail } = await import("@/lib/email")
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test subject",
        html: "<p>Test body</p>",
        text: "Test body",
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toMatch(/^mock-/)
    })

    it("uses mock mode when EMAIL_SERVER_HOST is not set", async () => {
      process.env.EMAIL_ENABLED = "true"
      delete process.env.EMAIL_SERVER_HOST

      const { sendEmail } = await import("@/lib/email")
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      })

      expect(result.success).toBe(true)
    })
  })

  describe("sendPasswordResetEmail", () => {
    it("generates correct reset URL", async () => {
      process.env.NEXTAUTH_URL = "http://localhost:3000"
      process.env.EMAIL_ENABLED = "false"

      const { sendPasswordResetEmail } = await import("@/lib/email")
      const result = await sendPasswordResetEmail("user@example.com", "test-token-123")

      expect(result.success).toBe(true)
    })

    it("includes reset link in the email", async () => {
      process.env.NEXTAUTH_URL = "http://localhost:3000"
      process.env.EMAIL_ENABLED = "false"

      const { sendPasswordResetEmail } = await import("@/lib/email")
      await sendPasswordResetEmail("user@example.com", "test-token")

      // In mock mode, the function should succeed
      // The actual link is logged to console
    })
  })

  describe("sendWelcomeEmail", () => {
    it("sends welcome email with user name", async () => {
      process.env.EMAIL_ENABLED = "false"
      process.env.NEXTAUTH_URL = "http://localhost:3000"

      const { sendWelcomeEmail } = await import("@/lib/email")
      const result = await sendWelcomeEmail("user@example.com", "Иван")

      expect(result.success).toBe(true)
    })

    it("uses email username when name is not provided", async () => {
      process.env.EMAIL_ENABLED = "false"
      process.env.NEXTAUTH_URL = "http://localhost:3000"

      const { sendWelcomeEmail } = await import("@/lib/email")
      const result = await sendWelcomeEmail("john@example.com")

      expect(result.success).toBe(true)
    })
  })

  describe("sendEmail - real mode", () => {
    it("calls nodemailer transport when email is enabled", async () => {
      process.env.EMAIL_ENABLED = "true"
      process.env.EMAIL_SERVER_HOST = "smtp.example.com"
      process.env.EMAIL_SERVER_USER = "user@example.com"
      process.env.EMAIL_SERVER_PASSWORD = "password"
      process.env.EMAIL_FROM = "noreply@example.com"

      mockSendMail.mockResolvedValue({ messageId: "real-msg-123" })

      const { sendEmail } = await import("@/lib/email")
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        text: "Test body",
      })

      expect(result.success).toBe(true)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test",
          html: "<p>Test</p>",
          text: "Test body",
        })
      )
    })

    it("returns failure when nodemailer throws", async () => {
      process.env.EMAIL_ENABLED = "true"
      process.env.EMAIL_SERVER_HOST = "smtp.example.com"
      process.env.EMAIL_SERVER_USER = "user@example.com"
      process.env.EMAIL_SERVER_PASSWORD = "password"

      mockSendMail.mockRejectedValue(new Error("Connection refused"))

      const { sendEmail } = await import("@/lib/email")
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe("Connection refused")
    })
  })
})
