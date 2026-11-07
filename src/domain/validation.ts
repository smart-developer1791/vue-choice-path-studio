export function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

export function list(value: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max)
    throw new Error(`${label} must be an array with at most ${max} entries.`)
  return value
}

export function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`${label} must be unique.`)
}

export function jsonText(source: string): unknown {
  if (source.length > 120000) throw new Error('Workspace JSON exceeds 120,000 characters.')
  return JSON.parse(source) as unknown
}

export function text(value: unknown, label: string, max: number, empty = false): string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (!empty && !value.trim()) ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)
  )
    throw new Error(`${label} must be ${empty ? 'at most' : '1–'}${max} characters.`)
  return value.replace(/\r\n?/g, '\n')
}
