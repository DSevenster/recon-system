/**
 * Field registry — plain config objects, no logic.
 * runChecks.js reads this array and dispatches to the right check function.
 */
export const fields = [

  // ─── Customer ───────────────────────────────────────────────────────────

  { id: "customer-name", field: "Customer name", category: "Customer",
    checkType: "fuzzyMatch",
    noAction: true,
    sources: ["brokerApplication.customerName", "hpAgreement.customerName",
              "purchaseInvoice.customerName", "paymentMandate.accountHolderName",
              "previousApplication.customerName"] },

  { id: "customer-address", field: "Customer address", category: "Customer",
    checkType: "fuzzyMatch",
    noAction: true,
    sources: ["brokerApplication.address", "hpAgreement.address",
              "purchaseInvoice.customerAddress", "previousApplication.address"] },

  { id: "customer-dob", field: "Date of birth", category: "Customer",
    checkType: "exactMatch",
    sources: ["brokerApplication.dob", "hpAgreement.dob", "previousApplication.dob"] },

  { id: "employment-status", field: "Employment status", category: "Customer",
    checkType: "exactMatch",
    sources: ["brokerApplication.employmentStatus", "previousApplication.employmentStatus"] },

  { id: "employment-duration", field: "Employment duration", category: "Customer",
    checkType: "exactMatch",
    sources: ["brokerApplication.employmentDuration", "previousApplication.employmentDuration"],
    note: "Duration increased from 2 to 3 years — plausible, treat as pass with note" },

  // ─── Vehicle ────────────────────────────────────────────────────────────

  { id: "vehicle-registration", field: "Vehicle registration", category: "Vehicle",
    checkType: "exactMatch", normalise: "strip-spaces",
    sources: ["brokerApplication.vehicleReg", "hpAgreement.vehicleReg",
              "purchaseInvoice.vehicleReg", "systemChecks.hpiCheck.registration"] },

  { id: "vehicle-make-model", field: "Vehicle make / model", category: "Vehicle",
    checkType: "fuzzyMatch",
    sources: ["brokerApplication.vehicleMake", "hpAgreement.vehicleMake",
              "purchaseInvoice.vehicleMake"] },

  { id: "vehicle-year", field: "Vehicle year", category: "Vehicle",
    checkType: "exactMatch",
    sources: ["brokerApplication.vehicleYear", "hpAgreement.vehicleYear"] },

  { id: "vehicle-mileage", field: "Vehicle mileage", category: "Vehicle",
    checkType: "numericTolerance", tolerance: 2000, noAction: true,
    sources: ["brokerApplication.vehicleMileage", "purchaseInvoice.vehicleMileage"] },

  { id: "hpi-clear", field: "HPI vehicle finance check", category: "Vehicle",
    checkType: "systemLookup",
    sources: ["systemChecks.hpiCheck.outstandingFinance"],
    expected: false },

  // ─── Financial ──────────────────────────────────────────────────────────

  { id: "cash-price", field: "Cash price", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.cashPrice", "hpAgreement.cashPrice",
              "purchaseInvoice.vehiclePrice"] },

  { id: "deposit", field: "Deposit amount", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.deposit", "hpAgreement.deposit",
              "purchaseInvoice.deposit"] },

  { id: "amount-financed", field: "Amount to finance", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.amountToFinance", "hpAgreement.advance",
              "purchaseInvoice.amountToFinance"] },

  { id: "monthly-payment", field: "Monthly payment", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.monthlyPayment", "hpAgreement.monthlyPayment"] },

  { id: "total-payable", field: "Total amount payable", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.totalPayable", "hpAgreement.totalPayable"] },

  { id: "apr", field: "APR", category: "Financial",
    checkType: "exactMatch",
    sources: ["brokerApplication.apr", "hpAgreement.apr"] },

  { id: "invoice-extras-cap", field: "Invoice extras", category: "Financial",
    checkType: "policyRule", rule: "invoice-extras-cap" },

  { id: "finance-company", field: "Finance company on invoice", category: "Financial",
    checkType: "exactMatch",
    sources: ["purchaseInvoice.financeCompany"],
    expected: "Northgate Motor Finance Ltd" },

  { id: "first-payment-date", field: "First payment date", category: "Financial",
    checkType: "presenceCheck",
    sources: ["hpAgreement.firstPaymentDate"] },

  { id: "vat-applicability", field: "VAT applicability", category: "Financial",
    checkType: "presenceCheck",
    sources: ["purchaseInvoice.vatApplicable"] },

  { id: "trade-sale", field: "Trade sale indicator", category: "Financial",
    checkType: "presenceCheck",
    sources: ["purchaseInvoice.tradeSale"],
    expected: false },

  // ─── Dealer / payee ─────────────────────────────────────────────────────

  { id: "dealer-name", field: "Dealer name", category: "Dealer / payee",
    checkType: "entityResolution",
    sources: ["hpAgreement.dealerName", "purchaseInvoice.from",
              "supplierDeclaration.dealerName", "giroSlip.payeeName",
              "fundsForm.dealerName"],
    resolverDoc: "fcaRegisterLookup" },

  { id: "dealer-address", field: "Dealer address", category: "Dealer / payee",
    checkType: "fuzzyMatch",
    sources: ["supplierDeclaration.dealerAddress",
              "fcaRegisterLookup.registeredAddress"] },

  { id: "fca-permission", field: "FCA permission", category: "Dealer / payee",
    checkType: "systemLookup",
    sources: ["fcaRegisterLookup.status", "fcaRegisterLookup.permission"],
    expected: { status: "Authorised", permission: "Credit brokerage" } },

  { id: "sort-code", field: "Sort code", category: "Dealer / payee",
    checkType: "exactMatch",
    sources: ["giroSlip.sortCode", "fundsForm.sortCode"] },

  { id: "account-number", field: "Account number", category: "Dealer / payee",
    checkType: "exactMatch",
    sources: ["giroSlip.accountNumber", "fundsForm.accountNumber"] },

  // ─── System ─────────────────────────────────────────────────────────────

  { id: "gold-check", field: "Gold Check", category: "System",
    checkType: "systemLookup",
    sources: ["systemChecks.goldCheck.result"],
    expected: "No issues flagged" },

  // ─── Document presence checks ───────────────────────────────────────────

  { id: "doc-hp-agreement", field: "HP Agreement received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["hpAgreement.customerName", "hpAgreement.cashPrice", "hpAgreement.advance", "hpAgreement.term"] },

  { id: "doc-purchase-invoice", field: "Purchase Invoice received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["purchaseInvoice.invoiceNumber", "purchaseInvoice.vehiclePrice", "purchaseInvoice.invoiceTotal"] },

  { id: "doc-supplier-declaration", field: "Supplier Declaration received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["supplierDeclaration.signedBy", "supplierDeclaration.dateSigned", "supplierDeclaration.correctlyCompleted"] },

  { id: "doc-payment-mandate", field: "Payment Mandate received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["paymentMandate.dateSigned", "paymentMandate.received"] },

  { id: "doc-giro-slip", field: "Giro Slip received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["giroSlip.sortCode", "giroSlip.accountNumber", "giroSlip.received"] },

  { id: "doc-funds-form", field: "Funds Form received", category: "Documents",
    checkType: "presenceCheck",
    sources: ["fundsForm.sortCode", "fundsForm.accountNumber", "fundsForm.received", "fundsForm.correctlyCompleted"] },
]
