export function deriveWorkflowDependencyMetadataFromIntent(intentDocument, processRef) {
  return Object.freeze({
    intentId: intentDocument.id,
    capabilities: (intentDocument.capabilities ?? []).map((c) => c.capabilityId),
    businessObjectId: intentDocument.subject?.businessObjectId ?? "default",
    processId: processRef.processId ?? processRef.ownerProcessId ?? "default-process",
    dependencies: Object.freeze([...(intentDocument.dependencies ?? [])]),
  });
}

export function createBusinessWorkflowDependencyMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-workflow-dependency-v1",
    ...partial,
    graph: Object.freeze([...(partial.graph ?? [])]),
  });
}

export default deriveWorkflowDependencyMetadataFromIntent;
