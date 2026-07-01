import { summarizeFortressEngine } from "./fortressSummarization.js";
import { runPortfolioIntelligenceEngine } from "../../portfolio/engine/runPortfolioIntelligenceEngine.js";

export function bridgeFortressToPortfolio(groupId, tenantId = "default") {
  const fortress = summarizeFortressEngine(groupId);
  const portfolio = runPortfolioIntelligenceEngine(groupId, tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    fortressContext: fortress.headline,
    portfolioContext: portfolio.summary?.headline,
    portfolioBridgeReady: portfolio.authorized,
    readOnly: true,
    explainable: true,
  });
}

export default bridgeFortressToPortfolio;
