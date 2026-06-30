export function explainEvolutionDocument(doc) {
  return Object.freeze({
    id: doc.evolutionId,
    title: doc.title,
    because: doc.summary,
    maturityLevel: doc.maturityLevel,
    evidenceCount: doc.evidenceRefs?.length ?? 0,
    traceable: (doc.lineage?.length ?? 0) > 0,
    autonomousExecutionForbidden: doc.autonomousExecutionForbidden !== false,
  });
}

export function explainEvolutionPlan(plan) {
  return Object.freeze({
    id: plan.planId,
    title: plan.title,
    objective: plan.objective,
    stepCount: plan.steps?.length ?? 0,
    expectedImpact: plan.expectedImpact,
    confidence: plan.confidence,
  });
}

export default { explainEvolutionDocument, explainEvolutionPlan };
