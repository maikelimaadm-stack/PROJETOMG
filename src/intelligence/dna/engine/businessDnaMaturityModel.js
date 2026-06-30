import { DNA_MATURITY_LEVELS } from "./businessDnaContracts.js";
import { upsertDnaMaturityRecord } from "./businessDnaStore.js";

const CAPABILITY_DOMAINS = [
  { id: "operations", label: "Operações" },
  { id: "decisions", label: "Decisões" },
  { id: "knowledge", label: "Conhecimento" },
  { id: "consulting", label: "Consultoria interna" },
  { id: "evolution", label: "Evolução contínua" },
];

/** Business DNA maturity model by capability domain */
export function computeDnaCapabilityMaturity(ctx) {
  const records = [];
  const memoryCount = ctx.memorySummary?.recordCount ?? 0;
  const graphNodes = ctx.graphSummary?.nodeCount ?? 0;
  const consultingRecs = ctx.consultingSummary?.recommendationCount ?? 0;
  const decisionCount = ctx.decisionSummary?.decisionCount ?? 0;
  const evolutionPlans = ctx.evolutionSummary?.planCount ?? 0;

  const scores = {
    operations: memoryCount >= 3 ? 3 : memoryCount >= 1 ? 2 : 1,
    knowledge: graphNodes >= 3 ? 3 : graphNodes >= 1 ? 2 : 1,
    consulting: consultingRecs >= 1 ? 2 : 1,
    decisions: decisionCount >= 1 ? 2 : 1,
    evolution: evolutionPlans >= 1 ? 2 : 1,
  };

  for (const domain of CAPABILITY_DOMAINS) {
    const score = scores[domain.id] ?? 1;
    const level = DNA_MATURITY_LEVELS[Math.min(score - 1, 3)] ?? DNA_MATURITY_LEVELS[0];
    const record = Object.freeze({
      recordId: `bmatur-${ctx.tenantId}-${domain.id}`,
      tenantId: ctx.tenantId,
      domainId: domain.id,
      label: domain.label,
      level,
      score,
      explainable: true,
      recordedAt: new Date().toISOString(),
    });
    upsertDnaMaturityRecord(record);
    records.push(record);
  }

  const avgScore = records.reduce((s, r) => s + r.score, 0) / records.length;
  const overallLevel =
    avgScore >= 2.5 ? DNA_MATURITY_LEVELS[3] : avgScore >= 2 ? DNA_MATURITY_LEVELS[2] : avgScore >= 1.5 ? DNA_MATURITY_LEVELS[1] : DNA_MATURITY_LEVELS[0];

  return Object.freeze({
    tenantId: ctx.tenantId,
    overallLevel,
    capabilities: Object.freeze(records),
    needsMaturation: Object.freeze(records.filter((r) => r.level === DNA_MATURITY_LEVELS[0] || r.level === DNA_MATURITY_LEVELS[1])),
    explainable: true,
  });
}

export default computeDnaCapabilityMaturity;
