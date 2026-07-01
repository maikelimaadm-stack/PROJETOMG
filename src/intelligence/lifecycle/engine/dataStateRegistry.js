import { upsertDataState } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildDataStateRegistry(groupId, ctx, lifecycleRules) {
  if (!ctx.authorized) return Object.freeze({ states: [] });

  const states = (lifecycleRules.rules ?? []).map((lr) =>
    upsertDataState(
      Object.freeze({
        stateId: `dstate-${lr.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: lr.ruleId,
        label: `Estado: ${lr.dataCategory}`,
        summary: `Dados ${lr.dataCategory} em estado ativo, protegidos por política.`,
        dataCategory: lr.dataCategory,
        currentState: "active",
        stateChangeRequiresAuditTrail: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "data_state_registry_built", entityType: "data_state" });
  return Object.freeze({ states: Object.freeze(states), explainable: true });
}

export default buildDataStateRegistry;
