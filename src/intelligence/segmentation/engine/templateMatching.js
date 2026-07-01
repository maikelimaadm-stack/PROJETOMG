import { getTemplateCatalog } from "./templateCatalog.js";
import { upsertTemplateMatch } from "./segmentationEngineStore.js";
import { appendTemplateAuditEntry } from "./templateAuditTrail.js";
import { registerTemplateVersion } from "./templateVersioning.js";

/** Match templates to tenant segment — organizational acceleration paths */
export function matchTemplatesToSegment(tenantId, segmentId, gaps = []) {
  const catalog = getTemplateCatalog();
  const matches = [];

  for (const template of catalog) {
    const segmentMatch = template.targetSegments.includes(segmentId);
    const gapOverlap = (template.priorityCapabilities ?? []).filter((cap) => gaps.includes(cap)).length;
    const baseScore = segmentMatch ? 70 : 30;
    const gapBonus = Math.min(gapOverlap * 10, 30);
    const compatibilityScore = Math.min(baseScore + gapBonus, 100);

    if (compatibilityScore >= 40) {
      const match = upsertTemplateMatch(
        Object.freeze({
          matchId: `tmatch-${tenantId}-${template.templateId}`,
          tenantId,
          templateId: template.templateId,
          templateLabel: template.label,
          segmentId,
          compatibilityScore,
          summary: template.summary,
          because: segmentMatch
            ? `Template alinhado ao segmento ${segmentId}.`
            : `Template compatível por capacidades prioritárias.`,
          priorityCapabilities: Object.freeze(template.priorityCapabilities ?? []),
          expectedImpact: template.expectedImpact,
          explainable: true,
          autonomousApplicationForbidden: true,
          recordedAt: new Date().toISOString(),
        })
      );
      registerTemplateVersion(template.templateId);
      matches.push(match);
    }
  }

  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  appendTemplateAuditEntry({
    tenantId,
    action: "templates_matched",
    templateId: matches[0]?.templateId ?? null,
  });

  return Object.freeze(matches);
}

export default matchTemplatesToSegment;
