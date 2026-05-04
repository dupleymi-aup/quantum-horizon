import React from "react"
import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { IsoclinesVisualization } from "./isoclines"

describe("IsoclinesVisualization", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the component header", () => {
    render(<IsoclinesVisualization />)
    const headers = screen.getAllByText(/Кольца Сатурна: Метод Изоклин/i)
    expect(headers.length).toBeGreaterThanOrEqual(1)
    expect(headers[0]).toBeInTheDocument()
  })

  it("renders mode selector buttons", () => {
    render(<IsoclinesVisualization />)
    const isoclinesButtons = screen.getAllByText("Изоклины")
    const trajectoriesButtons = screen.getAllByText("Траектории")
    expect(isoclinesButtons.length).toBeGreaterThanOrEqual(1)
    expect(trajectoriesButtons.length).toBeGreaterThanOrEqual(1)
  })

  it("renders educational content about isoclines", () => {
    render(<IsoclinesVisualization />)
    const headings = screen.getAllByText(/Что такое изоклины\?/i)
    expect(headings.length).toBeGreaterThanOrEqual(1)
    const isoclineTexts = screen.getAllByText(/Изоклина/i)
    expect(isoclineTexts.length).toBeGreaterThanOrEqual(1)
  })

  it("renders Saturn rings list", () => {
    render(<IsoclinesVisualization />)
    expect(screen.getAllByText("Кольцо D").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Кольцо C").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Кольцо B").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Деление Кассини").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Кольцо A").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Кольцо F").length).toBeGreaterThanOrEqual(1)
  })

  it("renders control buttons", () => {
    render(<IsoclinesVisualization />)
    const particleLabels = screen.getAllByLabelText(/Частицы/i)
    const fieldLabels = screen.getAllByLabelText(/Поле направлений/i)
    expect(particleLabels.length).toBeGreaterThanOrEqual(1)
    expect(fieldLabels.length).toBeGreaterThanOrEqual(1)
  })
})
