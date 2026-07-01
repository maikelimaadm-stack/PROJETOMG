/**
 * Corporate Standardization View — emerging group patterns and standardization opportunities.
 * @see Program 3.22
 */

export function buildCorporateStandardizationView(groupId, tenantId, patterns, opportunities, variances) {
  return Object.freeze({
    groupId,
    tenantId,
    title: "Padronização corporativa",
    patterns: Object.freeze(
      (patterns.patterns ?? []).map((p) => Object.freeze({ label: p.label, context: p.summary }))
    ),
    standardizationOpportunities: Object.freeze(
      (opportunities.opportunities ?? [])
        .filter((o) => o.label?.includes("padronização") || o.priority === "medium")
        .map((o) => Object.freeze({ label: o.label, context: o.summary, priority: o.priority }))
    ),
    variances: Object.freeze(
      (variances.variances ?? []).map((v) =>
        Object.freeze({ label: v.label, context: v.summary, deviationType: v.deviationType })
      )
    ),
    explainable: true,
    humanApprovalRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildCorporateStandardizationView;
