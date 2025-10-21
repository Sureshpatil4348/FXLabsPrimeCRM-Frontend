// lib/csv-validation.ts
export async function validateAndParseCSV(file: File): Promise<{
  emails: string[]
  error?: string
}> {
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { emails: [], error: "CSV file size cannot exceed 5MB" }
  }

  const text = await file.text()
  const lines = text.split(/\r?\n/)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const found = new Set<string>()

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const cells = line.split(/,|;|\t/).map((c) => c.trim()).filter(Boolean)
    for (const cell of cells) {
      if (emailPattern.test(cell)) {
        found.add(cell)
      }
    }
  }

  if (found.size > 1000) {
    return { emails: [], error: "CSV contains too many emails (max 1000)" }
  }

  return { emails: Array.from(found) }
}