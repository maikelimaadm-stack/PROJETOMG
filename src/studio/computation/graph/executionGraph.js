import { EXECUTION_GRAPH_VERSION } from "../contracts/computationContracts.js";

/** Execution Graph — compiled runtime view (Program 3.1) */

export function createExecutionGraph() {
  const kernels = new Map();
  const layers = [];

  return Object.freeze({
    version: EXECUTION_GRAPH_VERSION,
    addKernel(kernel) {
      if (!kernel?.kernelId) throw new Error("Execution kernel requires kernelId.");
      kernels.set(kernel.kernelId, Object.freeze({ strategy: "lazy", costTier: "O(1)", ...kernel }));
      return kernel.kernelId;
    },
    addLayer(kernelIds) {
      layers.push(Object.freeze([...kernelIds]));
      return layers.length - 1;
    },
    getKernel(id) {
      return kernels.get(id) ?? null;
    },
    getKernels() {
      return [...kernels.values()];
    },
    getLayers() {
      return [...layers];
    },
    clear() {
      kernels.clear();
      layers.length = 0;
    },
    snapshot() {
      return Object.freeze({
        version: EXECUTION_GRAPH_VERSION,
        kernels: this.getKernels(),
        layers: this.getLayers(),
      });
    },
  });
}

export function compileExecutionGraph(computationGraph, irNodes, dependencyEngine) {
  const executionGraph = createExecutionGraph();
  const order = dependencyEngine.resolveOrder();
  const nodeIds = order.length ? order : computationGraph.getNodes().map((n) => n.id);

  nodeIds.forEach((nodeId, index) => {
    const ir = irNodes.get(nodeId);
    if (!ir) return;
    executionGraph.addKernel({
      kernelId: `kernel:${nodeId}`,
      ownerFieldId: nodeId,
      ir,
      inputSlots: ir.inputSlots ?? [],
      outputSlot: ir.outputSlot ?? { slotId: nodeId },
      strategy: ir.strategy ?? "lazy",
      costTier: ir.costTier ?? "O(1)",
      cacheKeyTemplate: ir.cacheKeyTemplate ?? `{tenant}:{module}:{kernel}:${nodeId}`,
      invalidationTags: ir.invalidationTags ?? [nodeId],
      executionOrder: index,
    });
  });

  if (executionGraph.getKernels().length) {
    executionGraph.addLayer(executionGraph.getKernels().map((k) => k.kernelId));
  }

  return executionGraph;
}

export default createExecutionGraph;
