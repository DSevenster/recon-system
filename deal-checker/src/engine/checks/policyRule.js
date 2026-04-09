/**
 * Named policy rule implementations.
 * Each function receives the full deal object and returns a CheckResult.
 */

const rules = {
  /**
   * Invoice extras cap: adminFee + deliveryCharge must not exceed £400.
   */
  "invoice-extras-cap"(deal) {
    const inv = deal.purchaseInvoice
    const adminFee = inv.adminFee || 0
    const deliveryCharge = inv.deliveryCharge || 0
    const total = adminFee + deliveryCharge
    const cap = 400

    const status = total <= cap ? "pass" : "fail"

    const sources = [
      { doc: "Purchase Invoice", value: `adminFee=${adminFee}` },
      { doc: "Purchase Invoice", value: `deliveryCharge=${deliveryCharge}` },
    ]

    const message =
      status === "pass"
        ? `Invoice extras total £${total} (admin £${adminFee} + delivery £${deliveryCharge}), within £${cap} cap.`
        : `Invoice extras total £${total} (admin £${adminFee} + delivery £${deliveryCharge}), exceeds £${cap} cap.`

    const pasTemplate =
      status === "pass"
        ? null
        : `Invoice extras (admin fee £${adminFee} + delivery charge £${deliveryCharge} = £${total}) exceed the £${cap} policy cap. Please confirm whether these charges are correct or can be reduced.`

    return {
      id: "invoice-extras-cap",
      field: "Invoice extras",
      category: "Financial",
      checkType: "Policy rule",
      status,
      sources,
      message,
      pasTemplate,
    }
  },

  /**
   * Advance / Glass's Guide Retail ratio.
   * advance must be < 0.7 × glassGuideRetail when there is no deposit.
   */
  "advance-ggr-ratio"(deal) {
    const deposit = deal.brokerApplication.deposit || 0
    const advance = deal.hpAgreement.advance
    const ggr = deal.brokerApplication.glassGuideRetail

    // Rule only applies when there is no deposit
    if (deposit > 0) {
      return {
        id: "advance-ggr-ratio",
        field: "Advance / GGR ratio",
        category: "Financial",
        checkType: "Policy rule",
        status: "pass",
        sources: [
          { doc: "HP Agreement", value: `advance=${advance}` },
          { doc: "Broker Application", value: `deposit=${deposit}` },
        ],
        message: `Advance/GGR ratio check not applicable — deposit of £${deposit} is present.`,
        pasTemplate: null,
      }
    }

    const threshold = 0.7 * ggr
    const ratio = (advance / ggr * 100).toFixed(1)
    const status = advance < threshold ? "pass" : "fail"

    const sources = [
      { doc: "HP Agreement", value: `advance=${advance}` },
      { doc: "Broker Application", value: `glassGuideRetail=${ggr}` },
    ]

    const message =
      status === "pass"
        ? `Advance/GGR ratio ${ratio}%, within 70% threshold (advance £${advance}, GGR £${ggr}).`
        : `Advance/GGR ratio ${ratio}%, exceeds 70% threshold (advance £${advance}, GGR £${ggr}).`

    const pasTemplate =
      status === "pass"
        ? null
        : `The advance of £${advance} is ${ratio}% of the Glass's Guide Retail value (£${ggr}), exceeding the 70% policy limit. Please confirm this is acceptable or provide justification.`

    return {
      id: "advance-ggr-ratio",
      field: "Advance / GGR ratio",
      category: "Financial",
      checkType: "Policy rule",
      status,
      sources,
      message,
      pasTemplate,
    }
  },
}

/**
 * Policy rule dispatcher.
 *
 * @param {object} deal - full deal object
 * @param {string} ruleId - key into the rules map
 * @param {string} fieldName - (unused, each rule sets its own field name)
 * @param {object} [options]
 * @returns {object} CheckResult
 */
export function policyRule(deal, ruleId, fieldName, options = {}) {
  const ruleFn = rules[ruleId]
  if (!ruleFn) {
    throw new Error(`Unknown policy rule: "${ruleId}"`)
  }
  return ruleFn(deal)
}
