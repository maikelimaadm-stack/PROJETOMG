export function createBusinessComputedDependencyMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-dependency-metadata-v1",
    operandFieldIds: Object.freeze(partial.operandFieldIds ?? []),
    capabilityIds: Object.freeze(partial.capabilityIds ?? []),
    intentDependencies: Object.freeze(partial.intentDependencies ?? []),
    expressionDependencies: Object.freeze(partial.expressionDependencies ?? []),
    affectedEntities: Object.freeze(partial.affectedEntities ?? []),
    impactScope: partial.impactScope ?? "field_level",
  });
}

export function deriveDependencyMetadataFromIntent(intentDocument, computationRef) {
  const expressionSource = computationRef?.expressionSource ?? "";
  const operandMatches = expressionSource.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) ?? [];
  const reserved = new Set(["coalesce", "abs", "min", "max", "sum", "if", "and", "or", "not"]);
  const operandFieldIds = [...new Set(operandMatches.filter((t) => !reserved.has(t)))];

  return createBusinessComputedDependencyMetadata({
    operandFieldIds,
    capabilityIds: (intentDocument.capabilities ?? []).map((c) => c.capabilityId),
    intentDependencies: intentDocument.dependencies ?? [],
    affectedEntities: [
      intentDocument.subject?.entityId,
      intentDocument.subject?.businessObjectId,
    ].filter(Boolean),
  });
}

export default createBusinessComputedDependencyMetadata;
