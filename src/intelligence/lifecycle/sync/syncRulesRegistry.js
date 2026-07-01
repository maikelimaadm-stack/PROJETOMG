import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildSyncRulesRegistry(groupId, ctx) {
  return Object.freeze({
    groupId,
    rules: Object.freeze([
      Object.freeze({ id: "sync-approval", label: "Aprovações exigem confirmação backend", required: true }),
      Object.freeze({ id: "sync-execution", label: "Execuções sincronizam após aprovação", required: true }),
      Object.freeze({ id: "sync-audit", label: "Auditoria nunca pode ser omitida", required: true }),
      Object.freeze({ id: "sync-divergence", label: "Divergências devem ser visíveis", required: true }),
    ]),
    policyValid: ctx.authorized === true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildSyncRulesRegistry;
