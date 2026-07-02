import { runLifecycleSyncEngine } from "./lifecycleSyncEngine.js";
import { reconcileSync } from "./lifecycleSyncApiClient.js";
import { assembleSyncContext } from "./syncContextAssembly.js";
import { buildSyncDocument } from "./syncDocument.js";
import { buildStorageIntegrationDocument } from "./storageIntegrationDocument.js";
import { buildAuditOperationsDocument } from "./auditOperationsDocument.js";
import { buildSyncRulesRegistry } from "./syncRulesRegistry.js";
import { buildStorageRulesRegistry } from "./storageRulesRegistry.js";
import { buildBackupRulesRegistry } from "./backupRulesRegistry.js";
import { runAuditOperations } from "./auditOperationsEngine.js";
import { buildAuditReviewCenter } from "./auditReviewCenter.js";
import { LIFECYCLE_SYNC_VERSION, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export async function runFrontendBackendSyncPipeline(groupId, tenantId = "default", options = {}) {
  const ctx = assembleSyncContext(groupId, tenantId, options);
  if (!ctx.authorized) {
    return Object.freeze({ groupId, tenantId, authorized: false, reason: ctx.reason, ...SYNC_OWNERSHIP });
  }

  const syncResult = await runLifecycleSyncEngine(groupId, tenantId, options);
  const useMemory = options.useMemory ?? typeof fetch === "undefined";
  const reconcileResult = await reconcileSync(groupId, { useMemory, clienteId: options.clienteId });

  const syncRules = buildSyncRulesRegistry(groupId, ctx);
  const storageRules = buildStorageRulesRegistry(groupId, ctx);
  const backupRules = buildBackupRulesRegistry(groupId, ctx);
  const auditOps = runAuditOperations(groupId, tenantId, ctx);
  const reviewCenter = buildAuditReviewCenter(groupId);

  const syncDoc = buildSyncDocument(groupId, ctx, syncResult.summary);
  const storageDoc = buildStorageIntegrationDocument(groupId, ctx, syncResult.storageResult?.actions ?? []);
  const auditDoc = buildAuditOperationsDocument(groupId, ctx, syncResult.auditResult?.records ?? []);

  return Object.freeze({
    groupId,
    tenantId,
    pipelineVersion: LIFECYCLE_SYNC_VERSION,
    syncResult,
    reconcileResult,
    syncRules,
    storageRules,
    backupRules,
    auditOps,
    reviewCenter,
    syncDoc,
    storageDoc,
    auditDoc,
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default runFrontendBackendSyncPipeline;
