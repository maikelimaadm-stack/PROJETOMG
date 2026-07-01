import { summarizeFortressEngine } from "./fortressSummarization.js";
import { runPlatformGovernanceEngine } from "../../governance/engine/runPlatformGovernanceEngine.js";

export function bridgeFortressToGovernance(groupId, tenantId = "default") {
  const fortress = summarizeFortressEngine(groupId);
  const governance = runPlatformGovernanceEngine(groupId, tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    fortressContext: fortress.headline,
    governanceContext: governance.summary?.headline,
    governanceBridgeReady: governance.authorized,
    autonomousPolicyForbidden: true,
    readOnly: true,
    explainable: true,
  });
}

export default bridgeFortressToGovernance;
