import { COST_TIERS } from "../contracts/computationContracts.js";

/** Cost Analyzer — pre-publish cost estimation (Program 3.1) */

export function createCostAnalyzer() {
  return Object.freeze({
    analyzeDocument(document) {
      const tier = inferDocumentCostTier(document);
      const warnings = [];
      if (tier === "O cross-entity") {
        warnings.push({ code: "COMP_COST_CROSS_ENTITY", message: "Cross-entity computation requires acknowledgment." });
      }
      if (tier === "O prohibited") {
        warnings.push({ code: "COMP_COST_EXCEEDED", message: "Computation exceeds allowed cost tier.", severity: "error" });
      }
      return Object.freeze({
        tier,
        ok: tier !== "O prohibited",
        warnings,
        costEstimate: describeTier(tier),
      });
    },
    analyzeGraph(computationGraph) {
      const nodes = computationGraph.getNodes();
      let maxTier = "O(1)";
      nodes.forEach((node) => {
        const nodeTier = node.fieldKind === "rollup" ? "O cross-entity" : "O(1)";
        if (tierRank(nodeTier) > tierRank(maxTier)) maxTier = nodeTier;
      });
      return Object.freeze({ tier: maxTier, nodeCount: nodes.length, ok: maxTier !== "O prohibited" });
    },
    analyzeIr(irNode) {
      const tier = irNode.costTier ?? "O(1)";
      return Object.freeze({ tier, ok: COST_TIERS.includes(tier) && tier !== "O prohibited" });
    },
  });
}

function inferDocumentCostTier(document) {
  const kind = document?.fieldKind;
  if (kind === "rollup" || kind === "lookup") return "O cross-entity";
  if (kind === "aggregation" || kind === "calculated_collection") return "O(n)";
  return "O(1)";
}

function tierRank(tier) {
  return COST_TIERS.indexOf(tier);
}

function describeTier(tier) {
  const map = {
    "O(1)": { label: "Record-local", severity: "green" },
    "O(n)": { label: "Collection-scoped", severity: "yellow" },
    "O(n log n)": { label: "Sort/distinct aggregate", severity: "yellow" },
    "O cross-entity": { label: "Cross-entity", severity: "orange" },
    "O prohibited": { label: "Blocked", severity: "red" },
  };
  return map[tier] ?? map["O(1)"];
}

export default createCostAnalyzer;
