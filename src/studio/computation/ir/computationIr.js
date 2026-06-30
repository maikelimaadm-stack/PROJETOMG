import { COMPUTATION_IR_VERSION } from "../contracts/computationContracts.js";

/** Computation IR — portable compiled representation (Program 3.1) */

export function createComputationIrNode(partial = {}) {
  return Object.freeze({
    irVersion: COMPUTATION_IR_VERSION,
    kernelId: partial.kernelId ?? null,
    ownerFieldId: partial.ownerFieldId ?? null,
    op: partial.op ?? "expression",
    payload: Object.freeze(partial.payload ?? {}),
    inputSlots: Object.freeze(partial.inputSlots ?? []),
    outputSlot: Object.freeze(partial.outputSlot ?? { slotId: partial.ownerFieldId ?? "out" }),
    strategy: partial.strategy ?? "lazy",
    costTier: partial.costTier ?? "O(1)",
    cacheKeyTemplate: partial.cacheKeyTemplate ?? "{tenant}:{module}:{kernel}:{owner}",
    invalidationTags: Object.freeze(partial.invalidationTags ?? []),
    contentHash: partial.contentHash ?? null,
  });
}

export function compileDocumentToIr(document, expressionEngine) {
  const exprRoot = document.ast?.expression
    ? { astVersion: document.ast.astVersion, expression: document.ast.expression }
    : document.ast;

  let compiled = null;
  if (exprRoot?.expression && expressionEngine?.compile) {
    compiled = expressionEngine.compile(exprRoot);
  }

  return createComputationIrNode({
    kernelId: `ir:${document.id}`,
    ownerFieldId: document.id,
    op: document.fieldKind === "computed" || document.fieldKind === "derived" ? "expression" : document.fieldKind,
    payload: Object.freeze({
      compiledExpression: compiled,
      expressionSource: document.expressionSource,
      fieldKind: document.fieldKind,
      typeDescriptor: document.typeDescriptor,
    }),
    strategy: document.evaluationPolicy ?? "lazy",
    costTier: inferCostTier(document),
    invalidationTags: [document.id, document.moduleId],
    contentHash: document.contentHash,
  });
}

function inferCostTier(document) {
  const kind = document.fieldKind;
  if (kind === "rollup" || kind === "lookup") return "O cross-entity";
  if (kind === "aggregation" || kind === "calculated_collection") return "O(n)";
  return "O(1)";
}

export function serializeComputationIr(irNode) {
  return JSON.stringify({
    irVersion: irNode.irVersion,
    kernelId: irNode.kernelId,
    ownerFieldId: irNode.ownerFieldId,
    op: irNode.op,
    payload: irNode.payload,
    strategy: irNode.strategy,
    costTier: irNode.costTier,
    contentHash: irNode.contentHash,
  });
}

export function validateComputationIr(irNode) {
  const errors = [];
  if (!irNode?.irVersion) errors.push("irVersion is required.");
  if (irNode?.irVersion && irNode.irVersion !== COMPUTATION_IR_VERSION) {
    errors.push(`Invalid irVersion: ${irNode.irVersion}`);
  }
  return { valid: errors.length === 0, errors };
}

export default createComputationIrNode;
