function titleCaseWords(lowerWords: string[]): string {
  return lowerWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function humanizeSegment(segment: string, isLast: boolean): string {
  const s = segment.trim()
  if (!s) return s

  const withSpaces = s
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()

  const words = withSpaces.split(/\s+/).filter(Boolean)
  if (words.length === 0) return s

  if (isLast && words.length === 1 && words[0] === 'id') {
    return 'ID'
  }

  return titleCaseWords(words)
}

export function formatFieldDisplayName(fieldKey: string): string {
  const trimmed = fieldKey.trim()
  if (!trimmed) {
    return fieldKey
  }

  const segments = trimmed.split('.').filter((seg) => seg.length > 0)
  if (segments.length === 0) {
    return fieldKey
  }

  const leafLabel = humanizeSegment(segments[segments.length - 1], true)
  const namespace = segments[0].toLowerCase()
  if (namespace === 'user' || namespace === 'key') {
    return `${leafLabel} (${namespace})`
  }
  return leafLabel
}
