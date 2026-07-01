/**
 * Platform Governance Engine orchestrator.
 * @see Program 3.23
 */
import { PLATFORM_GOVERNANCE_VERSION } from "./platformGovernanceContracts.js";
import { getPlatformGovernanceStoreInfo } from "./platformGovernanceStore.js";
import { summarizePlatformGovernanceEngine } from "./governanceSummarization.js";
import { assembleGovernanceContext } from "./governanceContextAssembly.js";
import { buildPlatformGovernanceBosProjection } from "./governanceToBosProjection.js";
import { retrieveLatestGovernance } from "./governanceRetrieval.js";
import { enforceCrossTenantAccessGuard } from "./crossTenantAccessGuard.js";
import { enforceDataExposureGuard } from "./dataExposureGuard.js";

export function runPlatformGovernanceEngine(groupId, tenantId = "default", options = {}) {
  const ctx = assembleGovernanceContext(groupId, tenantId, options);
  return Object.freeze({
    engineVersion: PLATFORM_GOVERNANCE_VERSION,
    groupId,
    tenantId,
    authorized: ctx.authorized,
    storeInfo: getPlatformGovernanceStoreInfo(),
    summary: summarizePlatformGovernanceEngine(groupId),
    context: ctx,
    bosProjection: buildPlatformGovernanceBosProjection(groupId, tenantId, options),
    registry: retrieveLatestGovernance(groupId),
    crossTenantGuard: enforceCrossTenantAccessGuard(groupId, ctx, ctx.authorizedTenantIds ?? []),
    exposureGuard: enforceDataExposureGuard(groupId, ctx, "corporate_view"),
    platformGovernanceReady: ctx.authorized,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
    surveillanceForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    policyChangeRequiresAudit: true,
  });
}

export default runPlatformGovernanceEngine;
