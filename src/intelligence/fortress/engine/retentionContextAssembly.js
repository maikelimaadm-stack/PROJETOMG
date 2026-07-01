import { assembleComplianceContext } from "./complianceContextAssembly.js";

export function assembleRetentionContext(groupId, tenantId = "default", options = {}) {
  const base = assembleComplianceContext(groupId, tenantId, options);
  if (!base.authorized) return base;

  return Object.freeze({
    ...base,
    retentionScope: Object.freeze({
      dataCategories: Object.freeze(["audit", "intelligence", "memory", "governance"]),
      purgeRequiresPolicyAndAudit: true,
      retentionRequiresExplicitRule: true,
    }),
    assembledAt: new Date().toISOString(),
  });
}

export default assembleRetentionContext;
