import { createComputationEngine } from "../../../computation/createComputationEngine.js";

let sharedEngine = null;

export function getResolverComputationEngine() {
  if (!sharedEngine) {
    sharedEngine = createComputationEngine({ domainId: "intent-resolver" });
  }
  return sharedEngine;
}

/**
 * Run Computation Engine pipeline from Formula Document projection.
 * Mirrors Formula Builder pipeline — uses Computation Engine only (no designer bypass).
 */
export function runComputationProjection(formulaDocument, options = {}) {
  const engine = options.engine ?? getResolverComputationEngine();
  const expressionEngine = engine.expressionEngine;
  const source = formulaDocument.expressionSource?.trim() ?? "";

  if (!source) {
    return Object.freeze({
      formulaDocument,
      computationDocument: null,
      expressionAst: null,
      validation: Object.freeze({
        ok: false,
        valid: false,
        errors: Object.freeze([{ code: "EMPTY", message: "Empty expression.", severity: "error" }]),
        warnings: Object.freeze([]),
        diagnostics: Object.freeze([]),
      }),
      compiled: null,
      preview: null,
    });
  }

  let ast = null;
  try {
    ast = expressionEngine.parse(source, {
      documentId: formulaDocument.id,
      designerId: "intent-resolver",
      metadata: { consumer: "intent-resolver", derivedFromIntent: true },
    });
  } catch (err) {
    return Object.freeze({
      formulaDocument,
      computationDocument: null,
      expressionAst: null,
      validation: Object.freeze({
        ok: false,
        valid: false,
        errors: Object.freeze([
          { code: "COMP_PARSE", message: err?.message ?? "Parse failed.", severity: "error" },
        ]),
        warnings: Object.freeze([]),
        diagnostics: Object.freeze([]),
      }),
      compiled: null,
      preview: null,
    });
  }

  const computationDocument = engine.createDocument({
    id: formulaDocument.computationDocumentId,
    ownerId: formulaDocument.ownerFieldId,
    ownerType: "field",
    moduleId: formulaDocument.moduleId,
    entityId: formulaDocument.entityId,
    fieldKind: formulaDocument.fieldKind,
    expressionSource: formulaDocument.expressionSource,
    ast,
    evaluationPolicy: formulaDocument.evaluationPolicy,
  });

  const validation = engine.validate(computationDocument);
  let compiled = null;
  let preview = null;

  if (validation.ok) {
    compiled = engine.compile(computationDocument);
    preview = engine.evaluate(computationDocument, {
      variables: options.sampleVariables ?? formulaDocument.sampleVariables ?? {},
      studioPartial: {
        moduleId: formulaDocument.moduleId,
        designerId: "intent-resolver",
      },
      runtimePartial: {
        moduleId: formulaDocument.moduleId,
        record: options.sampleVariables ?? formulaDocument.sampleVariables ?? {},
      },
    });
  }

  return Object.freeze({
    formulaDocument,
    computationDocument,
    expressionAst: ast,
    validation,
    compiled,
    executionGraph: compiled?.executionGraph ?? null,
    computationGraph: compiled?.computationGraph ?? null,
    preview,
    inferredType: preview?.inferredType ?? "unknown",
  });
}

export default runComputationProjection;
