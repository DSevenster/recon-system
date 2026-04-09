import { fields } from './fieldRegistry.js'
import { exactMatch } from './checks/exactMatch.js'
import { fuzzyMatch } from './checks/fuzzyMatch.js'
import { numericTolerance } from './checks/numericTolerance.js'
import { policyRule } from './checks/policyRule.js'
import { entityResolve } from './checks/entityResolve.js'

/**
 * Resolve a dot-notation path against an object.
 * Returns undefined if any segment is missing.
 */
function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

/**
 * Turn a dot-notation path into a human-readable document label.
 * "brokerApplication.customerName" → "Broker Application"
 * "systemChecks.hpiCheck.registration" → "HPI Check"
 */
function docLabel(path) {
  const segment = path.split(".")[0]
  const labels = {
    brokerApplication: "Broker Application",
    previousApplication: "Previous Application",
    hpAgreement: "HP Agreement",
    purchaseInvoice: "Purchase Invoice",
    supplierDeclaration: "Supplier Declaration",
    paymentMandate: "Payment Mandate",
    giroSlip: "Giro Slip",
    fundsForm: "Funds Form",
    fcaRegisterLookup: "FCA Register",
    systemChecks: "System Checks",
  }

  // For nested system checks, use a more specific label
  if (segment === "systemChecks") {
    const sub = path.split(".")[1]
    if (sub === "goldCheck") return "Gold Check"
    if (sub === "hpiCheck") return "HPI Check"
  }

  return labels[segment] || segment
}

/**
 * Resolve source paths from a field config into { doc, value } arrays.
 * Skips sources whose top-level section doesn't exist in the deal
 * (e.g. previousApplication may be absent).
 */
function resolveSources(deal, sourcePaths) {
  const resolved = []
  for (const path of sourcePaths) {
    const topLevel = path.split(".")[0]
    if (deal[topLevel] == null) continue
    const value = resolvePath(deal, path)
    if (value === undefined) continue
    resolved.push({ doc: docLabel(path), field: path, value })
  }
  return resolved
}

/**
 * Handle systemLookup checks.
 */
function runSystemLookup(deal, entry) {
  const sources = resolveSources(deal, entry.sources)
  const expected = entry.expected

  let pass = true
  if (typeof expected === "object" && expected !== null && !Array.isArray(expected)) {
    // Multi-field expected: check each key
    for (const [key, val] of Object.entries(expected)) {
      const source = sources.find(s => s.field.endsWith("." + key))
      if (!source || source.value !== val) {
        pass = false
        break
      }
    }
  } else {
    // Single expected value
    pass = sources.length > 0 && sources.every(s => s.value === expected)
  }

  const status = pass ? "pass" : "fail"

  const message = pass
    ? `${entry.field} confirmed — ${sources.map(s => `${s.doc}: ${s.value}`).join(", ")}.`
    : `${entry.field} check failed — ${sources.map(s => `${s.doc}: ${s.value}`).join(", ")}. Expected: ${JSON.stringify(expected)}.`

  return {
    id: entry.id,
    field: entry.field,
    category: entry.category,
    checkType: "System lookup",
    status,
    sources: sources.map(({ doc, value }) => ({ doc, value })),
    message,
    pasTemplate: pass ? null : `${entry.field} did not match expected value. Found: ${sources.map(s => `${s.doc} shows "${s.value}"`).join("; ")}. Please investigate.`,
  }
}

/**
 * Handle presenceCheck checks.
 */
function runPresenceCheck(deal, entry) {
  const sources = resolveSources(deal, entry.sources)
  const allPresent = sources.length === entry.sources.length &&
    sources.every(s => s.value != null && s.value !== "")

  // If expected value is specified, also check it matches
  let valueMatch = true
  if ("expected" in entry && allPresent) {
    valueMatch = sources.every(s => s.value === entry.expected)
  }

  const pass = allPresent && valueMatch
  const status = pass ? "pass" : "fail"

  const message = pass
    ? `${entry.field} — confirmed present and correct.`
    : `${entry.field} — ${!allPresent ? "missing required fields" : "unexpected value"}: ${sources.map(s => `${s.doc}=${JSON.stringify(s.value)}`).join(", ")}.`

  return {
    id: entry.id,
    field: entry.field,
    category: entry.category,
    checkType: "Presence check",
    status,
    sources: sources.map(({ doc, value }) => ({ doc, value })),
    message,
    pasTemplate: pass ? null : `${entry.field}: required fields are missing or have unexpected values. Please ensure all fields are completed correctly.`,
  }
}

/**
 * Handle exactMatch with an expected value (single source compared to a known value).
 */
function runExactMatchWithExpected(deal, entry) {
  const sources = resolveSources(deal, entry.sources)
  // Add the expected value as a virtual source for comparison
  const allSources = [
    ...sources.map(({ doc, value }) => ({ doc, value })),
    { doc: "Expected", value: entry.expected },
  ]
  return exactMatch(allSources, entry.field, { id: entry.id, category: entry.category })
}

/**
 * Run all registered checks against a deal and return CheckResult[].
 *
 * @param {object} deal
 * @returns {object[]} CheckResult[]
 */
export function runChecks(deal) {
  const results = []

  for (const entry of fields) {
    let result

    switch (entry.checkType) {
      case "exactMatch": {
        if ("expected" in entry) {
          result = runExactMatchWithExpected(deal, entry)
        } else {
          const sources = resolveSources(deal, entry.sources)
          result = exactMatch(
            sources.map(({ doc, value }) => ({ doc, value })),
            entry.field,
            { id: entry.id, category: entry.category }
          )
        }
        break
      }

      case "fuzzyMatch": {
        const sources = resolveSources(deal, entry.sources)
        result = fuzzyMatch(
          sources.map(({ doc, value }) => ({ doc, value })),
          entry.field,
          { id: entry.id, category: entry.category }
        )
        break
      }

      case "numericTolerance": {
        const sources = resolveSources(deal, entry.sources)
        result = numericTolerance(
          sources.map(({ doc, value }) => ({ doc, value })),
          entry.field,
          entry.tolerance,
          { id: entry.id, category: entry.category }
        )
        break
      }

      case "policyRule": {
        result = policyRule(deal, entry.rule, entry.field)
        break
      }

      case "entityResolution": {
        const sources = resolveSources(deal, entry.sources)
        const resolver = deal[entry.resolverDoc]
        result = entityResolve(
          sources.map(({ doc, value }) => ({ doc, value })),
          resolver,
          entry.field,
          { id: entry.id, category: entry.category }
        )
        break
      }

      case "systemLookup": {
        result = runSystemLookup(deal, entry)
        break
      }

      case "presenceCheck": {
        result = runPresenceCheck(deal, entry)
        break
      }

      default:
        throw new Error(`Unknown checkType: "${entry.checkType}" for field "${entry.id}"`)
    }

    // Attach note if present in config and override status to pass
    if (entry.note) {
      result.note = entry.note
      if (result.status === "fail") {
        result.status = "pass"
        result.message += ` Note: ${entry.note}`
        result.pasTemplate = null
      }
    }

    results.push(result)
  }

  return results
}
