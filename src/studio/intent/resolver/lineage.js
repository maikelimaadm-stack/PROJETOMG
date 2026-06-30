export function createLineageNode(partial) {
  return Object.freeze({
    nodeId: partial.nodeId,
    nodeKind: partial.nodeKind,
    parentId: partial.parentId ?? null,
    version: partial.version ?? 1,
    timestamp: partial.timestamp ?? new Date().toISOString(),
    ref: partial.ref ?? null,
  });
}

export function buildResolverLineage(intentDocument, session, derivationId) {
  const nodes = [
    createLineageNode({
      nodeId: intentDocument.id,
      nodeKind: "business_intent",
      parentId: null,
      version: intentDocument.revision,
      ref: { intentId: intentDocument.id, revision: intentDocument.revision },
    }),
    createLineageNode({
      nodeId: session.resolverSessionId,
      nodeKind: "resolver_session",
      parentId: intentDocument.id,
      version: 1,
      ref: { sessionId: session.resolverSessionId },
    }),
    createLineageNode({
      nodeId: derivationId,
      nodeKind: "derivation",
      parentId: session.resolverSessionId,
      version: 1,
      ref: { derivationId },
    }),
  ];
  return Object.freeze(nodes);
}

export default buildResolverLineage;
