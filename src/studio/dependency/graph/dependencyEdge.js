/** Dependency Edge — official edge model (Program 2.3.3) */

export function createDependencyEdge(partial = {}) {
  if (!partial.from || !partial.to) throw new Error("Dependency edge requires from and to.");
  return Object.freeze({
    from: partial.from,
    to: partial.to,
    kind: partial.kind ?? "depends-on",
    metadata: Object.freeze({
      dependencyExplanation: partial.metadata?.dependencyExplanation ?? null,
      aiHints: Object.freeze(partial.metadata?.aiHints ?? []),
      ...(partial.metadata ?? {}),
    }),
  });
}

export default createDependencyEdge;
