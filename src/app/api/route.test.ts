import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/route"

describe("api/route", () => {
  describe("GET", () => {
    it("should return API index with name, version, and endpoints", async () => {
      const response = GET()
      expect(response.status).toBe(200)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: Record<
        string,
        { auth?: unknown; visualizations?: unknown; activity?: unknown; achievements?: unknown }
      > = await response.json()
      expect(data.name).toBe("Quantum Horizon API")
      expect(data.version).toBeTruthy()
      expect(data.endpoints).toBeDefined()
      expect(data.endpoints.auth).toBeDefined()
      expect(data.endpoints.visualizations).toBeDefined()
      expect(data.endpoints.activity).toBeDefined()
      expect(data.endpoints.achievements).toBeDefined()
    })

    it("should have correct content type", () => {
      const response = GET()
      expect(response.headers.get("content-type")).toContain("application/json")
    })
  })
})
