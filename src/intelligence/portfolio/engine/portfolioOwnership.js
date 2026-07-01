import { PORTFOLIO_OWNERSHIP } from "./portfolioIntelligenceContracts.js";

export function assertPortfolioOwnership(groupId, record) {
  if (record.groupId !== groupId) {
    return Object.freeze({ valid: false, reason: "Group scope mismatch" });
  }
  return Object.freeze({ valid: true, ownership: PORTFOLIO_OWNERSHIP, belongsToAuthorizedGroup: true });
}

export default assertPortfolioOwnership;
