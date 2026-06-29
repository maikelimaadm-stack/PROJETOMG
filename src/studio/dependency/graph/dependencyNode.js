/** Dependency Node — official node model (Program 2.3.3) */

export function createDependencyNode(partial = {}) {
  if (!partial.id) throw new Error("Dependency node requires id.");
  return Object.freeze({
    id: partial.id,
    kind: partial.kind ?? "reference",
    label: partial.label ?? partial.id,
    designerId: partial.designerId ?? null,
    metadata: Object.freeze({
      lineage: partial.metadata?.lineage ?? [],
      dependencyExplanation: partial.metadata?.dependencyExplanation ?? null,
      impactHint: partial.metadata?.impactHint ?? null,
      aiHints: Object.freeze(partial.metadata?.aiHints ?? []),
      documentation: partial.metadata?.documentation ?? null,
      ...(partial.metadata ?? {}),
    }),
  });
}

export default createDependencyNode;
