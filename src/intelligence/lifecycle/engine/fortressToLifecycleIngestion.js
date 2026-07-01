/**
 * Fortress → Data Lifecycle ingestion.
 * @see Program 3.25
 */
import { assembleLifecycleContext } from "./lifecycleContextAssembly.js";
import { buildLifecycleRulesRegistry } from "./lifecycleRulesRegistry.js";
import { buildArchiveRulesRegistry } from "./archiveRulesRegistry.js";
import { buildExpungeRulesRegistry } from "./expungeRulesRegistry.js";
import { buildHoldRulesRegistry } from "./holdRulesRegistry.js";
import { buildLifecycleScheduleRegistry } from "./lifecycleScheduleRegistry.js";
import { buildLifecycleEventRegistry } from "./lifecycleEventRegistry.js";
import { buildArchiveLifecycleRegistry } from "./archiveLifecycleRegistry.js";
import { buildExpungeApprovalRegistry } from "./expungeApprovalRegistry.js";
import { buildHoldEnforcementRegistry } from "./holdEnforcementRegistry.js";
import { buildDataStateRegistry } from "./dataStateRegistry.js";
import { buildDataClassificationRegistry } from "./dataClassificationRegistry.js";
import { buildRetentionExecutionRegistry } from "./retentionExecutionRegistry.js";
import { buildArchiveExecutionRegistry } from "./archiveExecutionRegistry.js";
import { buildExpungeExecutionRegistry } from "./expungeExecutionRegistry.js";
import { buildLifecycleComplianceRegistry } from "./lifecycleComplianceRegistry.js";
import { buildLifecycleExceptionRegistry } from "./lifecycleExceptionRegistry.js";
import { buildLifecycleReviewRegistry } from "./lifecycleReviewRegistry.js";
import { buildLifecycleDocument } from "./lifecycleDocument.js";
import { buildLifecycleSummary } from "./lifecycleSummaryEngine.js";
import { buildLifecycleControlCenter } from "./lifecycleControlCenter.js";
import { summarizeLifecycleEngine } from "./lifecycleSummarization.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";
import { upsertLifecycleAlert } from "./lifecycleStore.js";
import {
  DATA_LIFECYCLE_VERSION,
  ARCHIVE_ENGINE_VERSION,
  EXPUNGE_ENGINE_VERSION,
  LEGAL_HOLD_ENGINE_VERSION,
  LIFECYCLE_OWNERSHIP,
} from "./dataLifecycleContracts.js";

export function analyzeDataLifecycleContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleLifecycleContext(groupId, tenantId, options);

  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      analyzedAt: new Date().toISOString(),
      authorized: false,
      reason: ctx.reason,
      ...LIFECYCLE_OWNERSHIP,
    });
  }

  const lifecycleRules = buildLifecycleRulesRegistry(groupId, ctx);
  const archiveRules = buildArchiveRulesRegistry(groupId, ctx, lifecycleRules);
  const expungeRules = buildExpungeRulesRegistry(groupId, ctx, lifecycleRules);
  const holdRules = buildHoldRulesRegistry(groupId, ctx);
  const schedules = buildLifecycleScheduleRegistry(groupId, ctx, lifecycleRules);
  const events = buildLifecycleEventRegistry(groupId, ctx);
  const archiveLifecycles = buildArchiveLifecycleRegistry(groupId, ctx, archiveRules);
  const expungeApprovals = buildExpungeApprovalRegistry(groupId, ctx);
  const holdEnforcements = buildHoldEnforcementRegistry(groupId, ctx, holdRules);
  const dataStates = buildDataStateRegistry(groupId, ctx, lifecycleRules);
  const classifications = buildDataClassificationRegistry(groupId, ctx);
  const retentionExecutions = buildRetentionExecutionRegistry(groupId, ctx, schedules);
  const archiveExecutions = buildArchiveExecutionRegistry(groupId, ctx, archiveLifecycles);
  const expungeExecutions = buildExpungeExecutionRegistry(groupId, ctx, expungeApprovals);
  const compliance = buildLifecycleComplianceRegistry(groupId, ctx);
  const exceptions = buildLifecycleExceptionRegistry(groupId, ctx);
  const reviews = buildLifecycleReviewRegistry(groupId, ctx);

  const summaryDetail = summarizeLifecycleEngine(groupId);
  const summary = buildLifecycleSummary(groupId, ctx, lifecycleRules, archiveLifecycles, expungeApprovals, events);
  const lifecycleDoc = buildLifecycleDocument(groupId, ctx, summaryDetail);
  const controlCenter = buildLifecycleControlCenter(groupId, ctx, summary, {
    expungeApprovals,
    holdEnforcements,
    archiveLifecycles,
    expungeExecutions,
    compliance,
  });

  if (expungeExecutions.expungeAllowed === false) {
    upsertLifecycleAlert(
      Object.freeze({
        alertId: `lalert-${groupId}-expunge`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        title: "Expurgo controlado — aprovação necessária",
        severity: "info",
        category: "expunge",
        summary: "Nenhum expurgo físico sem política, aprovação humana e trilha.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    );
  }

  appendLifecycleAuditEntry({
    groupId,
    action: "lifecycle_analyzed",
    entityId: lifecycleDoc.document?.documentId ?? null,
    entityType: "lifecycle",
  });

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    authorized: true,
    engineVersion: DATA_LIFECYCLE_VERSION,
    archiveEngineVersion: ARCHIVE_ENGINE_VERSION,
    expungeEngineVersion: EXPUNGE_ENGINE_VERSION,
    legalHoldEngineVersion: LEGAL_HOLD_ENGINE_VERSION,
    summary,
    summaryDetail,
    lifecycleRules,
    archiveRules,
    expungeRules,
    holdRules,
    schedules,
    events,
    archiveLifecycles,
    expungeApprovals,
    holdEnforcements,
    dataStates,
    classifications,
    retentionExecutions,
    archiveExecutions,
    expungeExecutions,
    compliance,
    exceptions,
    reviews,
    lifecycleDoc,
    controlCenter,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export function ingestFortressToLifecycle(groupId, tenantId = "default", options = {}) {
  return analyzeDataLifecycleContext(groupId, tenantId, options);
}

export default { analyzeDataLifecycleContext, ingestFortressToLifecycle };
