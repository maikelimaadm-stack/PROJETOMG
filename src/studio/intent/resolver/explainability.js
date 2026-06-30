export function buildExplainabilityReport(intentDocument, session, derivationPlan, outputs) {
  return Object.freeze({
    schemaVersion: "mak-resolver-explainability-report-v1",
    whyExists: outputs?.generationReason ?? "Business intent requires a computed value.",
    generatedBy: session.initiatedBy,
    generatedAt: session.completedAt ?? session.startedAt,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    capabilities: (intentDocument.capabilities ?? []).map((c) => c.capabilityId),
    rulesParticipated: (intentDocument.rules ?? []).map((r) => r.phrase ?? r),
    objectsParticipated: [
      intentDocument.subject?.businessObjectId,
      intentDocument.subject?.fieldId,
    ].filter(Boolean),
    versionsParticipated: Object.freeze({
      intentRevision: intentDocument.revision,
      resolverVersion: outputs?.resolverVersion,
      compatibilityVersion: outputs?.compatibilityVersion,
    }),
    dependenciesParticipated: intentDocument.dependencies ?? [],
    derivationKinds: derivationPlan.map((p) => p.derivationKind),
    businessSummary: intentDocument.intentPhrase,
  });
}

export default buildExplainabilityReport;
