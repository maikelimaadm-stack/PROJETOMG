export function explainComplianceRule(rule) {
  if (!rule) return null;
  return Object.freeze({
    label: rule.label,
    because: rule.summary ?? "Regra de compliance protege isolamento e conformidade operacional.",
    status: rule.status,
    explainable: true,
  });
}

export default { explainComplianceRule };
