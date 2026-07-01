import { upsertHoldEnforcement, upsertDataState } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";
import { resolveLifecycleStateTransition } from "./lifecycleLifecycle.js";
import { LEGAL_HOLD_ENGINE_VERSION, LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function applyLegalHold(groupId, ctx, partial = {}) {
  if (!ctx.authorized) {
    return Object.freeze({ applied: false, reason: "Escopo não autorizado." });
  }

  const enforcement = upsertHoldEnforcement(
    Object.freeze({
      enforcementId: partial.enforcementId ?? `henf-appl-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: partial.label ?? "Legal hold aplicado",
      summary: "Arquivamento e expurgo suspensos enquanto hold estiver ativo.",
      active: true,
      holdRemovalRequiresAuthorization: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  const state = upsertDataState(
    Object.freeze({
      stateId: `dstate-hold-${enforcement.enforcementId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Em legal hold",
      summary: "Dados protegidos contra arquivamento e expurgo.",
      currentState: "on_hold",
      stateChangeRequiresAuditTrail: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({
    groupId,
    action: "legal_hold_applied",
    entityId: enforcement.enforcementId,
    entityType: "hold_enforcement",
  });

  return Object.freeze({
    applied: true,
    engineVersion: LEGAL_HOLD_ENGINE_VERSION,
    enforcement,
    state,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export function releaseLegalHold(groupId, ctx, enforcementId, authorized = false) {
  if (!ctx.authorized || !authorized) {
    appendLifecycleAuditEntry({
      groupId,
      action: "hold_release_blocked",
      entityId: enforcementId,
      entityType: "hold_enforcement",
      humanApproved: false,
    });
    return Object.freeze({
      released: false,
      reason: "Remoção de legal hold exige autorização e auditoria.",
      holdRemovalRequiresAuthorization: true,
    });
  }

  const transition = resolveLifecycleStateTransition("on_hold", "release_hold", true);

  appendLifecycleAuditEntry({
    groupId,
    action: "legal_hold_released",
    entityId: enforcementId,
    entityType: "hold_enforcement",
    humanApproved: true,
  });

  return Object.freeze({
    released: true,
    engineVersion: LEGAL_HOLD_ENGINE_VERSION,
    nextState: transition.nextState,
    holdRemovalRequiresAuthorization: true,
    explainable: true,
  });
}

export default { applyLegalHold, releaseLegalHold };
