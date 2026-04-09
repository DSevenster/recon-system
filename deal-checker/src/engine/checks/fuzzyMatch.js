/**
 * Tokenise a string into lowercase words.
 */
function tokenise(value) {
  if (value == null) return []
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Compute token-overlap similarity between two values.
 * similarity = sharedTokens / max(tokensA.length, tokensB.length)
 */
function similarity(a, b) {
  const tokensA = new Set(tokenise(a))
  const tokensB = new Set(tokenise(b))
  if (tokensA.size === 0 && tokensB.size === 0) return 1
  const shared = [...tokensA].filter(t => tokensB.has(t)).length
  return shared / Math.max(tokensA.size, tokensB.size)
}

/**
 * Fuzzy-match check across multiple document sources using token overlap.
 *
 * Thresholds: >= 0.5 = pass, 0.3–0.5 = warn, < 0.3 = fail
 *
 * @param {Array<{ doc: string, value: any }>} sources
 * @param {string} fieldName
 * @param {object} [options]
 * @param {string} [options.id]
 * @param {string} [options.category]
 * @returns {object} CheckResult
 */
export function fuzzyMatch(sources, fieldName, options = {}) {
  // Compute pairwise similarities for all combinations
  let minSim = 1
  let minPair = [sources[0], sources[0]]
  let totalSim = 0
  let pairCount = 0

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const sim = similarity(sources[i].value, sources[j].value)
      totalSim += sim
      pairCount++
      if (sim < minSim) {
        minSim = sim
        minPair = [sources[i], sources[j]]
      }
    }
  }

  const confidence = pairCount > 0 ? totalSim / pairCount : 1
  const score = Math.round(minSim * 100)

  let status
  if (minSim >= 0.5) status = "pass"
  else if (minSim >= 0.3) status = "warn"
  else status = "fail"

  const worstPair = pairCount > 0
    ? {
        docA: minPair[0].doc,
        valueA: String(minPair[0].value),
        docB: minPair[1].doc,
        valueB: String(minPair[1].value),
        score: minSim,
      }
    : null

  const variants = sources.map(s => `${s.doc}="${s.value}"`).join(", ")

  const message =
    status === "pass"
      ? `${fieldName} fuzzy match pass (${score}% similarity). Variants: ${variants}.`
      : status === "warn"
        ? `${fieldName} fuzzy match warning (${score}% similarity). Lowest pair: ${minPair[0].doc}="${minPair[0].value}" vs ${minPair[1].doc}="${minPair[1].value}".`
        : `${fieldName} fuzzy match fail (${score}% similarity). Lowest pair: ${minPair[0].doc}="${minPair[0].value}" vs ${minPair[1].doc}="${minPair[1].value}".`

  const pasTemplate =
    status === "pass"
      ? null
      : `Please confirm the correct ${fieldName.toLowerCase()}. We found the following variants: ${variants}.`

  return {
    id: options.id || fieldName.toLowerCase().replace(/\s+/g, "-") + "-fuzzy",
    field: fieldName,
    category: options.category || "Customer",
    checkType: "Fuzzy match",
    status,
    confidence,
    worstPair,
    sources,
    message,
    pasTemplate,
  }
}
