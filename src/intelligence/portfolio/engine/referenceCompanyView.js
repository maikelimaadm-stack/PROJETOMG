/**
 * Reference Company View — authorized reference companies for replication.
 * @see Program 3.22
 */

export function buildReferenceCompanyView(groupId, tenantId, references, comparison) {
  return Object.freeze({
    groupId,
    tenantId,
    title: "Empresas referência",
    references: Object.freeze(
      (references.references ?? []).map((r) =>
        Object.freeze({ label: r.label, processArea: r.processArea, context: r.summary })
      )
    ),
    aboveStandard: Object.freeze(
      (comparison.aboveStandard ?? []).map((c) =>
        Object.freeze({ label: c.label, healthScore: c.healthScore, maturityScore: c.maturityScore })
      )
    ),
    explainable: true,
    humanApprovalRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildReferenceCompanyView;
