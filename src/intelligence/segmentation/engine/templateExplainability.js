export function explainTemplateCompatibility(result) {
  return Object.freeze({
    templateId: result.templateId,
    label: result.templateLabel,
    score: result.compatibilityScore,
    because: result.because,
    priorityCapabilities: result.priorityCapabilities,
  });
}

export default explainTemplateCompatibility;
