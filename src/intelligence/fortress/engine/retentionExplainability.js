export function explainRetentionRule(rule) {
  if (!rule) return null;
  return Object.freeze({
    label: rule.label,
    because: `${rule.summary ?? "Retenção explícita."} — ${rule.retentionDays ?? 0} dias.`,
    dataCategory: rule.dataCategory,
    explainable: true,
  });
}

export default { explainRetentionRule };
