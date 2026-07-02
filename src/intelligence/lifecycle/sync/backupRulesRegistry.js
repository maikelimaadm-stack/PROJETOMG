import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildBackupRulesRegistry(groupId, ctx) {
  return Object.freeze({
    groupId,
    rules: Object.freeze([
      Object.freeze({ id: "backup-policy", label: "Backup requer política válida", required: true }),
      Object.freeze({ id: "backup-audit", label: "Backup acionado gera trilha", required: true }),
      Object.freeze({ id: "backup-scope", label: "Backup respeita escopo autorizado", required: true }),
    ]),
    authorizedProvider: ctx.authorized === true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildBackupRulesRegistry;
