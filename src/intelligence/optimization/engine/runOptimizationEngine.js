/**
 * Optimization Loop Engine orchestrator.
 */
import { OPTIMIZATION_ENGINE_VERSION } from "./optimizationEngineContracts.js";
import { getOptimizationEngineStoreInfo } from "./optimizationEngineStore.js";
import { summarizeOptimizationEngine } from "./optimizationSummarization.js";
import { assembleOptimizationContext } from "./optimizationContextAssembly.js";
import { buildOptimizationBosProjection } from "./optimizationToBosProjection.js";
import { buildOptimizationSeedsRegistry } from "./optimizationSeedsRegistry.js";
import { trackOptimizationProgress } from "./optimizationTracking.js";

export function runOptimizationEngine(tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: OPTIMIZATION_ENGINE_VERSION,
    tenantId,
    storeInfo: getOptimizationEngineStoreInfo(),
    summary: summarizeOptimizationEngine(tenantId),
    context: assembleOptimizationContext(tenantId, options),
    bosProjection: buildOptimizationBosProjection(tenantId, options),
    seeds: buildOptimizationSeedsRegistry(tenantId),
    tracking: trackOptimizationProgress(tenantId),
    optimizationEngineReady: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default runOptimizationEngine;
