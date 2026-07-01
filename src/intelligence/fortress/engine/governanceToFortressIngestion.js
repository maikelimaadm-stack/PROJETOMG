/**
 * Governance → Compliance/Retention/Audit Fortress ingestion.
 * @see Program 3.24
 */
import { assembleComplianceContext } from "./complianceContextAssembly.js";
import { assembleRetentionContext } from "./retentionContextAssembly.js";
import { assembleAuditContext } from "./auditContextAssembly.js";
import { buildComplianceRulesRegistry } from "./complianceRulesRegistry.js";
import { buildRetentionRulesRegistry } from "./retentionRulesRegistry.js";
import { buildAuditRulesRegistry } from "./auditRulesRegistry.js";
import { buildDataExposureRules } from "./dataExposureRules.js";
import { buildPolicyEnforcementRules } from "./policyEnforcementRules.js";
import { buildRetentionScheduleRegistry } from "./retentionScheduleRegistry.js";
import { buildExpiryExpungeRegistry } from "./expiryExpungeRegistry.js";
import { buildLegalHoldRegistry } from "./legalHoldRegistry.js";
import { buildArchiveRegistry } from "./archiveRegistry.js";
import { buildAuditEventRegistry } from "./auditEventRegistry.js";
import { buildFortressAuditReviewRegistry } from "./fortressAuditReviewRegistry.js";
import { buildComplianceReviewRegistry } from "./complianceReviewRegistry.js";
import { buildExceptionRegistry } from "./exceptionRegistry.js";
import { buildComplianceDocument } from "./complianceDocument.js";
import { buildRetentionDocument } from "./retentionDocument.js";
import { buildAuditDocument } from "./auditDocument.js";
import { buildFortressSummary } from "./fortressSummaryEngine.js";
import { summarizeFortressEngine } from "./fortressSummarization.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";
import { upsertFortressAlert } from "./fortressStore.js";
import {
  COMPLIANCE_FORTRESS_VERSION,
  RETENTION_FORTRESS_VERSION,
  AUDIT_FORTRESS_VERSION,
  FORTRESS_OWNERSHIP,
} from "./complianceFortressContracts.js";
import { ingestFortressToLifecycle } from "../../lifecycle/engine/fortressToLifecycleIngestion.js";

export function analyzeComplianceFortressContext(groupId, tenantId = "default", options = {}) {
  const complianceCtx = assembleComplianceContext(groupId, tenantId, options);
  const retentionCtx = assembleRetentionContext(groupId, tenantId, options);
  const auditCtx = assembleAuditContext(groupId, tenantId, options);

  if (!complianceCtx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      analyzedAt: new Date().toISOString(),
      authorized: false,
      reason: complianceCtx.reason,
      ...FORTRESS_OWNERSHIP,
    });
  }

  const complianceRules = buildComplianceRulesRegistry(groupId, complianceCtx);
  const retentionRules = buildRetentionRulesRegistry(groupId, retentionCtx);
  const auditRules = buildAuditRulesRegistry(groupId, auditCtx);
  const exposureRules = buildDataExposureRules(groupId, complianceCtx);
  const enforcementRules = buildPolicyEnforcementRules(groupId, complianceCtx);
  const schedules = buildRetentionScheduleRegistry(groupId, retentionCtx, retentionRules);
  const expunges = buildExpiryExpungeRegistry(groupId, retentionCtx);
  const holds = buildLegalHoldRegistry(groupId, retentionCtx);
  const archives = buildArchiveRegistry(groupId, retentionCtx, retentionRules);
  const auditEvents = buildAuditEventRegistry(groupId, auditCtx);
  const auditReview = buildFortressAuditReviewRegistry(groupId, auditCtx);
  const complianceReview = buildComplianceReviewRegistry(groupId, complianceCtx, complianceRules);
  const exceptions = buildExceptionRegistry(groupId, complianceCtx);

  const summaryDetail = summarizeFortressEngine(groupId);
  const summary = buildFortressSummary(groupId, complianceCtx, complianceRules, retentionRules, auditEvents, complianceReview);

  const complianceDoc = buildComplianceDocument(groupId, complianceCtx, summaryDetail);
  const retentionDoc = buildRetentionDocument(groupId, retentionCtx, summaryDetail);
  const auditDoc = buildAuditDocument(groupId, auditCtx, summaryDetail);

  if (expunges.purgeAllowed === false) {
    upsertFortressAlert(
      Object.freeze({
        alertId: `falert-${groupId}-purge`,
        groupId,
        authorizedTenantIds: complianceCtx.authorizedTenantIds,
        title: "Expurgo controlado — aprovação necessária",
        severity: "info",
        category: "purge",
        summary: "Nenhum expurgo automático. Política e auditoria obrigatórias.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    );
  }

  appendFortressAuditEntry({
    groupId,
    action: "fortress_analyzed",
    entityId: complianceDoc.document?.documentId ?? null,
    entityType: "fortress",
  });

  try {
    ingestFortressToLifecycle(groupId, tenantId, { ...options, fortressDocumentId: complianceDoc.document?.documentId });
  } catch {
    /* non-blocking lifecycle ingestion */
  }

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    authorized: true,
    engineVersion: COMPLIANCE_FORTRESS_VERSION,
    retentionEngineVersion: RETENTION_FORTRESS_VERSION,
    auditEngineVersion: AUDIT_FORTRESS_VERSION,
    summary,
    summaryDetail,
    complianceRules,
    retentionRules,
    auditRules,
    exposureRules,
    enforcementRules,
    schedules,
    expunges,
    holds,
    archives,
    auditEvents,
    auditReview,
    complianceReview,
    exceptions,
    complianceDoc,
    retentionDoc,
    auditDoc,
    ...FORTRESS_OWNERSHIP,
    explainable: true,
  });
}

export function ingestGovernanceToFortress(groupId, tenantId = "default", options = {}) {
  return analyzeComplianceFortressContext(groupId, tenantId, options);
}

export default { analyzeComplianceFortressContext, ingestGovernanceToFortress };
