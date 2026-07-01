import { assembleComplianceContext } from "./complianceContextAssembly.js";
import { listGovernanceAuditTrail } from "../../governance/engine/governanceAuditTrail.js";

export function assembleAuditContext(groupId, tenantId = "default", options = {}) {
  const base = assembleComplianceContext(groupId, tenantId, options);
  if (!base.authorized) return base;

  return Object.freeze({
    ...base,
    governanceAuditTrail: Object.freeze(listGovernanceAuditTrail(groupId, { limit: 20 })),
    sensitiveActionsRequireAudit: true,
    assembledAt: new Date().toISOString(),
  });
}

export default assembleAuditContext;
