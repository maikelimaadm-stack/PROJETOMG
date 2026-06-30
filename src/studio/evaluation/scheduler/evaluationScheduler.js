/** Evaluation Scheduler — ordering and async-ready scheduling (Program 2.3.5) */

export function createEvaluationScheduler(dependencyEngine) {
  return Object.freeze({
    resolveOrder(graph) {
      if (!graph) return Object.freeze([]);
      try {
        return dependencyEngine?.resolveOrder?.() ?? [];
      } catch {
        return Object.freeze([]);
      }
    },
    schedule(items, graph) {
      const order = this.resolveOrder(graph);
      if (!order.length) {
        return Object.freeze([...items].map((item, index) => Object.freeze({ ...item, executionOrder: index })));
      }
      const rank = new Map(order.map((id, i) => [id, i]));
      const sorted = [...items].sort((a, b) => (rank.get(a.ownerId) ?? 999) - (rank.get(b.ownerId) ?? 999));
      return Object.freeze(sorted.map((item, index) => Object.freeze({ ...item, executionOrder: index })));
    },
    describeSchedule(items) {
      return Object.freeze({
        itemCount: items.length,
        executionOrder: Object.freeze(items.map((i) => i.ownerId)),
        metadata: Object.freeze({
          parallelizable: false,
          optimizationHints: Object.freeze(["Follow dependency topological order."]),
          aiHints: Object.freeze(["Schedule heavy expressions after dependencies resolve."]),
        }),
      });
    },
  });
}

export default createEvaluationScheduler;
