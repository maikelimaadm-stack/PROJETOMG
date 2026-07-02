import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildStorageRulesRegistry(groupId, ctx) {
  return Object.freeze({
    groupId,
    rules: Object.freeze([
      Object.freeze({ id: "storage-policy", label: "Storage requer política válida", required: true }),
      Object.freeze({ id: "storage-audit", label: "Toda ação de storage gera trilha", required: true }),
      Object.freeze({ id: "storage-tenant", label: "Storage isolado por tenant", required: true }),
    ]),
    authorizedProvider: ctx.authorized === true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildStorageRulesRegistry;
