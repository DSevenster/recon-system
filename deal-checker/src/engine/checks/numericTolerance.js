/**
 * Numeric tolerance check across multiple document sources.
 *
 * - Exact match (diff === 0): pass
 * - Within tolerance: warn (discrepancy worth noting, but acceptable)
 * - Beyond tolerance: fail
 *
 * @param {Array<{ doc: string, value: number }>} sources
 * @param {string} fieldName
 * @param {number} tolerance - the acceptable difference
 * @param {object} [options]
 * @param {string} [options.id]
 * @param {string} [options.category]
 * @returns {object} CheckResult
 */
export function numericTolerance(sources, fieldName, tolerance, options = {}) {
  const values = sources.map(s => Number(s.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const diff = max - min

  let status
  if (diff === 0) status = "pass"
  else if (diff <= tolerance) status = "warn"
  else status = "fail"

  const diffLabel = diff.toLocaleString("en-GB")
  const tolLabel = tolerance.toLocaleString("en-GB")
  const pairs = sources.map(s => `${s.doc}=${s.value.toLocaleString("en-GB")}`).join(" vs ")

  const message =
    status === "pass"
      ? `${fieldName} matches across all sources (${sources.map(s => s.doc).join(", ")}).`
      : status === "warn"
        ? `${fieldName} discrepancy: ${pairs} (difference ${diffLabel}, within ${tolLabel} tolerance).`
        : `${fieldName} exceeds tolerance: ${pairs} (difference ${diffLabel}, tolerance ${tolLabel}).`

  const pasTemplate =
    status === "pass"
      ? null
      : status === "warn"
        ? null
        : `Please confirm the correct ${fieldName.toLowerCase()}. ${pairs}. The difference of ${diffLabel} exceeds the tolerance of ${tolLabel}.`

  return {
    id: options.id || fieldName.toLowerCase().replace(/\s+/g, "-") + "-tolerance",
    field: fieldName,
    category: options.category || "Vehicle",
    checkType: "Numeric tolerance",
    status,
    sources,
    message,
    pasTemplate,
  }
}
