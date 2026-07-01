import { getAuthorizedGroupScope } from "../../dna/engine/businessDnaStore.js";
import { upsertGovernancePolicy } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildGroupAuthorizationRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorizations: [] });

  const dnaScope = getAuthorizedGroupScope(groupId);
  const authorization = upsertGovernancePolicy(
    Object.freeze({
      policyId: `gauth-${groupId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      policyType: "governance.policy.authorization",
      label: "Autorização de grupo registrada",
      summary: `Grupo ${groupId} autorizado para ${ctx.authorizedTenantIds.length} empresa(s).`,
      ownerClientId: dnaScope?.ownerClientId ?? ctx.ownerClientId,
      registeredAt: dnaScope?.registeredAt ?? new Date().toISOString(),
      lifecycleState: "active",
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendGovernanceAuditEntry({ groupId, action: "group_authorization_registered", entityId: authorization.policyId, entityType: "authorization" });
  return Object.freeze({ authorizations: Object.freeze([authorization]), explainable: true });
}

export default buildGroupAuthorizationRegistry;
