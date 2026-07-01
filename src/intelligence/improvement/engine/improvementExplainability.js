export function explainImprovementLoop(loop) {
  if (!loop) return null;
  return Object.freeze({
    loopId: loop.loopId,
    title: loop.title,
    because: "Ciclo de melhoria baseado em adoção, impacto e evolução operacional da empresa.",
    impactScore: loop.impactScore ?? 0,
    requiresHumanApproval: true,
    autonomousExecutionForbidden: true,
    explainable: true,
  });
}

export function explainImprovementOpportunity(opp) {
  if (!opp) return null;
  return Object.freeze({
    opportunityId: opp.opportunityId,
    title: opp.title,
    because: opp.summary,
    expectedImpact: opp.expectedImpact,
    explainable: true,
  });
}

export default { explainImprovementLoop, explainImprovementOpportunity };
