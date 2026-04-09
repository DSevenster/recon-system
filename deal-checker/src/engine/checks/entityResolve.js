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
export function entityResolve(sources, resolverSource, fieldName, options = {}) {
  const firmNorm = normalise(resolverSource.firmName)
  const tradingNorms = (resolverSource.tradingNames || []).map(normalise)
  const allKnown = [firmNorm, ...tradingNorms]

  const resolved = []
  const unresolved = []

  for (const source of sources) {
    const norm = normalise(source.value)
    if (allKnown.some(known => known === norm || norm.includes(known) || known.includes(norm))) {
      resolved.push(source)
    } else {
      unresolved.push(source)
    }
  }

  const allResolved = unresolved.length === 0
  const allExactFirmMatches = resolved.length > 0 &&
    resolved.every(source => normalise(source.value) === firmNorm)

  const status = allResolved
    ? (allExactFirmMatches ? "pass" : "warn")
    : "fail"

  const chain = sources.map(s => `${s.doc}="${s.value}"`).join(" → ")

  const message = allResolved
    ? allExactFirmMatches
      ? `${fieldName} matched FCA register exactly: ${chain}.`
      : `${fieldName} resolved via FCA register: ${chain}. All variants map to "${resolverSource.firmName}".`
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
    sources,
    message,
    pasTemplate,
  }
}
