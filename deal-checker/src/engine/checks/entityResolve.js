/**
 * Normalise a name for comparison.
 */
function normalise(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\bltd\b/g, "")
    .replace(/\blimited\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Entity resolution check.
 *
 * Checks whether all name variants from sources can be resolved against
 * an authoritative source (e.g. FCA register) by matching firmName or tradingNames.
 *
 * @param {Array<{ doc: string, value: string }>} sources - name variants from documents
 * @param {{ firmName: string, tradingNames: string[] }} resolverSource - authoritative entity data
 * @param {string} fieldName
 * @param {object} [options]
 * @param {string} [options.id]
 * @param {string} [options.category]
 * @returns {object} CheckResult
 */
/**
 * Token-overlap similarity between two strings (reused for fuzzy resolution scoring).
 */
function similarity(a, b) {
  const tokenise = s => String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)
  const tokensA = new Set(tokenise(a))
  const tokensB = new Set(tokenise(b))
  if (tokensA.size === 0 && tokensB.size === 0) return 1
  const shared = [...tokensA].filter(t => tokensB.has(t)).length
  return shared / Math.max(tokensA.size, tokensB.size)
}

export function entityResolve(sources, resolverSource, fieldName, options = {}) {
  const firmNorm = normalise(resolverSource.firmName)
  const tradingNorms = (resolverSource.tradingNames || []).map(normalise)
  const allKnown = [firmNorm, ...tradingNorms]

  const resolved = []
  const unresolved = []

  // Per-source confidence contributions and worst-pair tracking
  const contributions = []
  let worstScore = Infinity
  let worstSource = null
  let worstResolvedTo = null

  for (const source of sources) {
    const norm = normalise(source.value)
    const exactFirmMatch = norm === firmNorm || norm.includes(firmNorm) || firmNorm.includes(norm)
    const exactTradingMatch = tradingNorms.some(tn => norm === tn || norm.includes(tn) || tn.includes(norm))

    let contribution
    let resolvedTo

    if (exactFirmMatch) {
      contribution = 1.0
      resolvedTo = resolverSource.firmName
      resolved.push(source)
    } else if (exactTradingMatch) {
      contribution = 0.9
      resolvedTo = resolverSource.tradingNames.find((tn, i) => {
        const tnn = tradingNorms[i]
        return norm === tnn || norm.includes(tnn) || tnn.includes(norm)
      }) || resolverSource.firmName
      resolved.push(source)
    } else {
      // Try fuzzy match against firmName
      const fuzzySim = similarity(source.value, resolverSource.firmName)
      if (fuzzySim > 0.5) {
        contribution = fuzzySim
        resolvedTo = resolverSource.firmName
        resolved.push(source)
      } else {
        contribution = 0.0
        resolvedTo = null
        unresolved.push(source)
      }
    }

    contributions.push(contribution)

    if (contribution < worstScore) {
      worstScore = contribution
      worstSource = source
      worstResolvedTo = resolvedTo
    }
  }

  const confidence = contributions.length > 0
    ? contributions.reduce((a, b) => a + b, 0) / contributions.length
    : 1

  const worstPair = worstSource
    ? {
        docA: worstSource.doc,
        valueA: worstSource.value,
        docB: "FCA Register",
        valueB: worstResolvedTo || resolverSource.firmName,
        score: worstScore,
      }
    : null

  const allResolved = unresolved.length === 0

  const allExact = allResolved && contributions.every(c => c === 1.0)
  const status = allExact ? "pass" : allResolved ? "warn" : "fail"

  const chain = sources.map(s => `${s.doc}="${s.value}"`).join(" → ")

  const message = allResolved
    ? `${fieldName} resolved via FCA register: ${chain}. All variants map to "${resolverSource.firmName}".`
    : `${fieldName} resolution failed: ${unresolved.map(s => `${s.doc}="${s.value}"`).join(", ")} could not be matched to "${resolverSource.firmName}" or trading names [${resolverSource.tradingNames.join(", ")}].`

  const pasTemplate = allResolved
    ? null
    : `We could not resolve the following ${fieldName.toLowerCase()} variant(s): ${unresolved.map(s => `${s.doc} shows "${s.value}"`).join("; ")}. The FCA register shows firm name "${resolverSource.firmName}" with trading names [${resolverSource.tradingNames.join(", ")}]. Please confirm these refer to the same entity.`

  return {
    id: options.id || fieldName.toLowerCase().replace(/\s+/g, "-") + "-entity",
    field: fieldName,
    category: options.category || "Dealer / payee",
    checkType: "Entity resolution",
    status,
    confidence,
    worstPair,
    sources,
    message,
    pasTemplate,
  }
}
