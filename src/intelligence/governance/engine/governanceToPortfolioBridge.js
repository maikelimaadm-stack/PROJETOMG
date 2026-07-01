/**
 * Governance → Portfolio bridge (read-only validation).
 * @see Program 3.23
 */
import { summarizePlatformGovernanceEngine } from "./governanceSummarization.js";
import { runPortfolioIntelligenceEngine } from "../../portfolio/engine/runPortfolioIntelligenceEngine.js";
import { enforceDataExposureGuard } from "./dataExposureGuard.js";
import { assembleGovernanceContext } from "./governanceContextAssembly.js";

export function bridgeGovernanceToPortfolio(groupId, tenantId = "default") {
  const ctx = assembleGovernanceContext(groupId, tenantId);
  const exposure = enforceDataExposureGuard(groupId, ctx, "portfolio_command");
  const portfolio = runPortfolioIntelligenceEngine(groupId, tenantId);
  const governance = summarizePlatformGovernanceEngine(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    portfolioViewAllowed: exposure.exposureAllowed,
    governanceContext: governance.headline,
    portfolioContext: portfolio.summary?.headline,
    portfolioBridgeReady: exposure.exposureAllowed && portfolio.authorized,
    autonomousPortfolioForbidden: true,
    readOnly: true,
    explainable: true,
  });
}

export default bridgeGovernanceToPortfolio;
