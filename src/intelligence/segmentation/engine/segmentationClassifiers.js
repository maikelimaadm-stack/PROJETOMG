import { OPERATIONAL_SEGMENTS } from "./segmentationEngineContracts.js";
import { getSegmentationRules } from "./segmentationRules.js";
import {
  upsertSegmentationClassification,
  upsertSegmentationProfile,
} from "./segmentationEngineStore.js";
import { buildSegmentationLineage } from "./segmentationLineage.js";
import { registerSegmentationVersion } from "./segmentationVersioning.js";
import { appendSegmentationAuditEntry } from "./segmentationAuditTrail.js";

/** Classify tenant into operational segment — organizational only */
export function classifyOperationalSegment(ctx) {
  const rules = getSegmentationRules();
  const maturityScore = ctx.maturityScore ?? 0;
  const consultingRecs = ctx.consultingSummary?.recommendationCount ?? 0;
  const evolutionPlans = ctx.evolutionSummary?.planCount ?? 0;
  const decisionCount = ctx.decisionSummary?.decisionCount ?? 0;
  const gaps = ctx.gaps?.length ?? 0;
  const strengths = ctx.strengths?.length ?? 0;

  let matched = rules.find((r) => r.default);
  let because = "Operação ainda em formação — segmento emergente aplicado.";

  if (maturityScore >= 2.5 && strengths >= 3) {
    matched = rules.find((r) => r.segmentId === OPERATIONAL_SEGMENTS.OPERATIONALLY_MATURE);
    because = `Maturidade média ${maturityScore} com ${strengths} capacidades consolidadas.`;
  } else if (consultingRecs >= 1 && evolutionPlans >= 1) {
    matched = rules.find((r) => r.segmentId === OPERATIONAL_SEGMENTS.IMPROVEMENT_DRIVEN);
    because = "Consultoria e evolução ativas — orientação a melhoria contínua.";
  } else if (decisionCount >= 1 && maturityScore < 2.5) {
    matched = rules.find((r) => r.segmentId === OPERATIONAL_SEGMENTS.STRUCTURE_BUILDING);
    because = "Decisões estruturadas com maturidade ainda em construção.";
  } else if (evolutionPlans >= 1 && gaps >= 2) {
    matched = rules.find((r) => r.segmentId === OPERATIONAL_SEGMENTS.GROWTH_FOCUSED);
    because = `Planos de evolução com ${gaps} capacidades prioritárias para amadurecer.`;
  }

  const classification = upsertSegmentationClassification(
    Object.freeze({
      classificationId: `sclass-${ctx.tenantId}-${matched.segmentId}`,
      tenantId: ctx.tenantId,
      segmentId: matched.segmentId,
      segmentLabel: matched.label,
      confidence: maturityScore >= 2 ? "high" : "medium",
      because,
      evidenceRefs: Object.freeze([
        Object.freeze({ type: "maturity.score", value: maturityScore }),
        Object.freeze({ type: "strengths.count", value: strengths }),
        Object.freeze({ type: "gaps.count", value: gaps }),
      ]),
      explainable: true,
      organizationalScope: true,
      individualProfilingForbidden: true,
      classifiedAt: new Date().toISOString(),
    })
  );

  const profile = upsertSegmentationProfile(
    Object.freeze({
      profileId: `sprof-${ctx.tenantId}-${matched.segmentId}`,
      tenantId: ctx.tenantId,
      segmentId: matched.segmentId,
      segmentLabel: matched.label,
      summary: because,
      lifecycleState: "classified",
      evidenceRefs: classification.evidenceRefs,
      lineage: buildSegmentationLineage({
        dnaProfileIds: ctx.dnaProfile ? [ctx.dnaProfile.profileId] : [],
      }),
      explainable: true,
      individualProfilingForbidden: true,
    })
  );

  registerSegmentationVersion(ctx.tenantId, profile.profileId);
  appendSegmentationAuditEntry({
    tenantId: ctx.tenantId,
    action: "segment_classified",
    entityId: classification.classificationId,
    entityType: "classification",
  });

  return Object.freeze({ classification, profile, segmentId: matched.segmentId, segmentLabel: matched.label, because });
}

export default classifyOperationalSegment;
