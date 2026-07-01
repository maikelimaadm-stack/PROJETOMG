export function buildComplianceLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "governance", refId: partial.governanceRef ?? null }),
    Object.freeze({ source: "group_scope", refId: partial.groupId ?? null }),
  ].filter((l) => l.refId));
}

export function buildRetentionLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "retention_rule", refId: partial.ruleRef ?? null }),
    Object.freeze({ source: "governance", refId: partial.governanceRef ?? null }),
  ].filter((l) => l.refId));
}

export function buildAuditLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "audit_event", refId: partial.eventRef ?? null }),
    Object.freeze({ source: "governance_audit", refId: partial.governanceAuditRef ?? null }),
  ].filter((l) => l.refId));
}

export default { buildComplianceLineage, buildRetentionLineage, buildAuditLineage };
