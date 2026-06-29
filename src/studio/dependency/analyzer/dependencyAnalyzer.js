/** Dependency Analyzer — graph statistics and lineage (Program 2.3.3) */

export function createDependencyAnalyzer() {
  return Object.freeze({
    analyze(graph) {
      const snapshot = graph.snapshot();
      const incoming = new Map();
      const outgoing = new Map();
      snapshot.nodes.forEach((n) => {
        incoming.set(n.id, 0);
        outgoing.set(n.id, 0);
      });
      snapshot.edges.forEach((e) => {
        incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
        outgoing.set(e.from, (outgoing.get(e.from) ?? 0) + 1);
      });

      const orphans = snapshot.nodes
        .filter((n) => (incoming.get(n.id) ?? 0) === 0 && (outgoing.get(n.id) ?? 0) === 0)
        .map((n) => n.id);

      const roots = snapshot.nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => n.id);

      return Object.freeze({
        nodeCount: snapshot.nodes.length,
        edgeCount: snapshot.edges.length,
        orphans: Object.freeze(orphans),
        roots: Object.freeze(roots),
        byKind: Object.freeze(
          snapshot.nodes.reduce((acc, n) => {
            acc[n.kind] = (acc[n.kind] ?? 0) + 1;
            return acc;
          }, {})
        ),
        lineage: Object.freeze(
          snapshot.nodes.map((n) => ({
            id: n.id,
            kind: n.kind,
            upstream: snapshot.edges.filter((e) => e.to === n.id).map((e) => e.from),
            downstream: snapshot.edges.filter((e) => e.from === n.id).map((e) => e.to),
          }))
        ),
      });
    },
  });
}

export default createDependencyAnalyzer;
