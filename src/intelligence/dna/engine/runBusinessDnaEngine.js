/**
 * Business DNA Engine orchestrator — tenant-owned organizational identity.
 */
import { BUSINESS_DNA_ENGINE_VERSION } from "./businessDnaContracts.js";
import { getBusinessDnaStoreInfo } from "./businessDnaStore.js";
import { summarizeBusinessDnaEngine } from "./businessDnaSummarization.js";
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { buildBusinessDnaBosProjection } from "./businessDnaToBosProjection.js";
import {
  bridgeDnaToConsulting,
  bridgeDnaToDecision,
  bridgeDnaToEvolution,
} from "./businessDnaToIntelligenceBridges.js";
import { buildBusinessDnaSeedsRegistry } from "./businessDnaSeedsRegistry.js";
import { buildPortfolioView } from "./portfolioView.js";

export function runBusinessDnaEngine(tenantId = "default", options = {}) {
  let portfolio = null;
  if (options.groupId) {
    portfolio = buildPortfolioView(options.groupId, tenantId);
  }

  return Object.freeze({
    engineVersion: BUSINESS_DNA_ENGINE_VERSION,
    tenantId,
    storeInfo: getBusinessDnaStoreInfo(),
    summary: summarizeBusinessDnaEngine(tenantId),
    context: assembleBusinessDnaContext(tenantId),
    bosProjection: buildBusinessDnaBosProjection(tenantId),
    seeds: buildBusinessDnaSeedsRegistry(tenantId),
    consultingBridge: bridgeDnaToConsulting(tenantId),
    decisionBridge: bridgeDnaToDecision(tenantId),
    evolutionBridge: bridgeDnaToEvolution(tenantId),
    portfolio,
    businessDnaReady: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export default runBusinessDnaEngine;
