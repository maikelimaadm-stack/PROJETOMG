/**
 * Compliance, Retention & Audit Fortress orchestrator.
 * @see Program 3.24
 */
import { COMPLIANCE_FORTRESS_VERSION, FORTRESS_OWNERSHIP } from "./complianceFortressContracts.js";
import { getFortressStoreInfo } from "./fortressStore.js";
import { summarizeFortressEngine } from "./fortressSummarization.js";
import { assembleComplianceContext } from "./complianceContextAssembly.js";
import { buildFortressBosProjection } from "./fortressToBosProjection.js";
import { retrieveLatestFortress } from "./fortressRetrieval.js";

export function runComplianceFortressEngine(groupId, tenantId = "default", options = {}) {
  const ctx = assembleComplianceContext(groupId, tenantId, options);
  return Object.freeze({
    engineVersion: COMPLIANCE_FORTRESS_VERSION,
    groupId,
    tenantId,
    authorized: ctx.authorized,
    storeInfo: getFortressStoreInfo(),
    summary: summarizeFortressEngine(groupId),
    context: ctx,
    bosProjection: buildFortressBosProjection(groupId, tenantId, options),
    registry: retrieveLatestFortress(groupId),
    fortressReady: ctx.authorized,
    ...FORTRESS_OWNERSHIP,
    explainable: true,
  });
}

export default runComplianceFortressEngine;
