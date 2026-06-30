/**
 * Field Studio — Studio Evaluation Engine consumer (Program 2.3.5)
 * First consumer path for Computed/Derived fields; no local evaluators or caches.
 */
import { createEvaluationEngine } from "@/studio/evaluation/index.js";
import { getFieldExpressionEngine, buildFieldExpressionContext } from "../expression/fieldExpressionSetup.js";
import {
  getFieldDependencyEngine,
  buildFieldDocumentDependencyGraph,
} from "../dependency/fieldDependencySetup.js";
import { collectActiveFields } from "../fieldPropertyFields.js";

let fieldEvaluationEngine = null;

export function getFieldEvaluationEngine() {
  if (!fieldEvaluationEngine) {
    const dependencyEngine = getFieldDependencyEngine();
    fieldEvaluationEngine = createEvaluationEngine({
      dependencyEngine,
      functionCatalog: getFieldExpressionEngine().functionCatalog,
    });
  }
  return fieldEvaluationEngine;
}

/** Evaluate a single field expression via official Evaluation Pipeline. */
export function evaluateFieldExpression(source, fieldDocument, partial = {}) {
  const expressionEngine = getFieldExpressionEngine();
  const evaluationEngine = getFieldEvaluationEngine();
  const context = buildFieldExpressionContext(fieldDocument);
  const ast = expressionEngine.parse(source, {
    designerId: "field",
    metadata: { consumer: "field-evaluation", fieldNodeId: partial.fieldNodeId ?? null },
  });
  return evaluationEngine.evaluateExpression({
    ast,
    expressionContext: context,
    ownerId: partial.ownerId ?? `field-expr:${partial.fieldNodeId ?? "unknown"}`,
    strategy: partial.strategy ?? "eager",
  });
}

/** Batch-evaluate all expression sources in dependency order (structural foundation). */
export function evaluateFieldDocumentBatch(fieldDocument) {
  buildFieldDocumentDependencyGraph(fieldDocument);
  const evaluationEngine = getFieldEvaluationEngine();
  const expressionEngine = getFieldExpressionEngine();
  const context = buildFieldExpressionContext(fieldDocument);
  const fields = collectActiveFields(fieldDocument);

  const requests = fields
    .map((field) => {
      const source = field.expressionSource ?? field.presentation?.expressionDraft;
      if (!source || typeof source !== "string") return null;
      try {
        const ast = expressionEngine.parse(source, { designerId: "field", metadata: { fieldNodeId: field.fieldNodeId } });
        return {
          ast,
          expressionContext: context,
          ownerId: `expr:${field.fieldNodeId}`,
          strategy: "batch",
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return evaluationEngine.evaluateBatch(requests, evaluationEngine.dependencyEngine);
}

export default getFieldEvaluationEngine;
