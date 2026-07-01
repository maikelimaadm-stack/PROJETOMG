import { assembleImprovementContext } from "../../improvement/engine/improvementContextAssembly.js";
import { summarizeImprovementEngine } from "../../improvement/engine/improvementSummarization.js";
import { retrieveLatestImprovements } from "../../improvement/engine/improvementRetrieval.js";
import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";

export function assembleOptimizationContext(tenantId = "default", options = {}) {
  const improvementContext = assembleImprovementContext(tenantId, options);
  const improvementSummary = summarizeImprovementEngine(tenantId);
  const improvementRetrieved = retrieveLatestImprovements(tenantId);

  let groupScope = null;
  if (options.groupId) {
    groupScope = resolveAuthorizedGroupScope(options.groupId, tenantId);
  }

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    improvementContext,
    improvementSummary,
    improvementRetrieved,
    groupScope,
    authorized: groupScope != null || !options.groupId,
    explainable: true,
    belongsToEnterprise: true,
    unauthorizedAggregationForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default assembleOptimizationContext;
