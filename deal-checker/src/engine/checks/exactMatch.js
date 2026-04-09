/**
 * Normalise a value for comparison.
 * Strips whitespace, lowercases, removes currency symbols and commas.
 */
function normalise(value) {
  if (value == null) return ""
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[£$€,]/g, "")
    .replace(/\s+/g, "")
}

/**
 * Exact-match check across multiple document sources.
 *
 * @param {Array<{ doc: string, value: any }>} sources
 * @param {string} fieldName - human-readable field label
 * @param {object} [options]
 * @param {string} [options.id] - kebab-case check id
 * @param {string} [options.category] - result category
 * @returns {object} CheckResult
 */
export function exactMatch(sources, fieldName, options = {}) {
  const normalised = sources.map(s => ({
    ...s,
    norm: normalise(s.value),
  }))

  const unique = [...new Set(normalised.map(s => s.norm))]
  const allMatch = unique.length === 1

  const status = allMatch ? "pass" : "fail"

  const message = allMatch
    ? `${fieldName} matches across all sources (${sources.map(s => s.doc).join(", ")}).`
    : `${fieldName} mismatch: ${sources.map(s => `${s.doc}="${s.value}"`).join(" vs ")}.`

  const pasTemplate = allMatch
    ? null
    : `Please confirm the correct ${fieldName.toLowerCase()}. We found: ${sources.map(s => `${s.doc} shows "${s.value}"`).join("; ")}.`

  return {
    id: options.id || fieldName.toLowerCase().replace(/\s+/g, "-"),
    field: fieldName,
    category: options.category || "Documents",
    checkType: "Exact match",
    status,
    sources,
    message,
    pasTemplate,
  }
}
