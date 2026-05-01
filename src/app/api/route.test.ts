/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/route"

describe("api/route", () => {
  describe("GET", () => {
    it("should return hello message", async () => {
      const response = GET()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ message: "Hello, world!" })
    })

    it("should have correct content type", () => {
      const response = GET()
      expect(response.headers.get("content-type")).toContain("application/json")
    })
  })
})
