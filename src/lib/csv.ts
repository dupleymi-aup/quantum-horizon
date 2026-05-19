export function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCSV(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

export function buildMultiSectionCSV(sections: Array<{ title?: string; headers: string[]; rows: string[][] }>): string {
  const parts: string[] = []
  for (const section of sections) {
    if (section.title) {
      parts.push(section.title)
    }
    parts.push(section.headers.join(","))
    for (const row of section.rows) {
      parts.push(row.join(","))
    }
    parts.push("")
  }
  return parts.join("\n")
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
