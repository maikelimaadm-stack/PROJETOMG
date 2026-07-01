import { OPERATIONAL_SEGMENTS } from "./segmentationEngineContracts.js";
import { upsertSegmentationRule } from "./segmentationEngineStore.js";

const SEGMENT_RULES = [
  {
    segmentId: OPERATIONAL_SEGMENTS.OPERATIONALLY_MATURE,
    label: "Operação madura",
    minMaturityScore: 2.5,
    requiresStrengths: 3,
  },
  {
    segmentId: OPERATIONAL_SEGMENTS.IMPROVEMENT_DRIVEN,
    label: "Orientada a melhoria",
    minConsultingRecs: 1,
    minEvolutionPlans: 1,
  },
  {
    segmentId: OPERATIONAL_SEGMENTS.STRUCTURE_BUILDING,
    label: "Estruturação operacional",
    minDecisions: 1,
    maxMaturityScore: 2.4,
  },
  {
    segmentId: OPERATIONAL_SEGMENTS.GROWTH_FOCUSED,
    label: "Foco em crescimento",
    minEvolutionPlans: 1,
    minGaps: 2,
  },
  {
    segmentId: OPERATIONAL_SEGMENTS.EMERGING_OPERATION,
    label: "Operação emergente",
    default: true,
  },
];

export function registerSegmentationRules(tenantId = "default") {
  return SEGMENT_RULES.map((rule, i) =>
    upsertSegmentationRule(
      Object.freeze({
        ruleId: `srule-${tenantId}-${rule.segmentId}`,
        tenantId,
        segmentId: rule.segmentId,
        label: rule.label,
        criteria: Object.freeze({ ...rule }),
        order: i,
        explainable: true,
        organizationalScope: true,
        individualProfilingForbidden: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );
}

export function getSegmentationRules() {
  return Object.freeze(SEGMENT_RULES);
}

export default { registerSegmentationRules, getSegmentationRules };
