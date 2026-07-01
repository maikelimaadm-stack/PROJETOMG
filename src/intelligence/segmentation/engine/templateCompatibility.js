import { explainTemplateCompatibility } from "./templateExplainability.js";

export function assessTemplateCompatibility(template, segmentId, gaps = []) {
  const segmentMatch = template.targetSegments?.includes(segmentId) ?? false;
  const gapOverlap = (template.priorityCapabilities ?? []).filter((c) => gaps.includes(c)).length;
  const score = Math.min((segmentMatch ? 70 : 30) + gapOverlap * 10, 100);

  return Object.freeze({
    templateId: template.templateId,
    templateLabel: template.label,
    compatibilityScore: score,
    compatible: score >= 50,
    because: segmentMatch
      ? "Segmento operacional compatível com este template."
      : gapOverlap > 0
        ? "Capacidades prioritárias alinhadas ao template."
        : "Compatibilidade parcial — revisar prioridades.",
    explainability: explainTemplateCompatibility({
      templateId: template.templateId,
      templateLabel: template.label,
      compatibilityScore: score,
      because: segmentMatch ? "Segment match" : "Gap overlap",
      priorityCapabilities: template.priorityCapabilities,
    }),
  });
}

export default assessTemplateCompatibility;
