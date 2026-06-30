/**
 * Formula pipeline — sole path from Formula Document → Computation Document → Preview.
 * All parsing, validation, compile, and evaluate delegate to Computation Engine.
 */
import { getFormulaComputationEngine } from "./formulaCoreSetup.js";

export function syncFormulaPipeline(formulaDocument, options = {}) {
  const engine = getFormulaComputationEngine();
  const expressionEngine = engine.expressionEngine;

  let ast = null;
  let parseError = null;
  const source = formulaDocument.expressionSource?.trim() ?? "";
  if (source) {
    try {
      ast = expressionEngine.parse(source, {
        documentId: formulaDocument.id,
        designerId: "formula",
        metadata: { consumer: "formula-builder" },
      });
    } catch (err) {
      parseError = err;
    }
  }

  if (parseError) {
    return Object.freeze({
      formulaDocument,
      computationDocument: null,
      expressionAst: null,
      validation: Object.freeze({
        ok: false,
        valid: false,
        errors: Object.freeze([
          { code: "COMP_PARSE", message: parseError?.message ?? "Parse failed.", severity: "error" },
        ]),
        warnings: Object.freeze([]),
        diagnostics: Object.freeze([]),
        costEstimate: null,
      }),
      compiled: null,
      executionGraph: null,
      computationGraph: null,
      preview: null,
      inferredType: "unknown",
      dependencies: [],
      dependencyOrder: [],
      cycles: { hasCycle: false },
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

  const validation = source ? engine.validate(computationDocument) : Object.freeze({
    ok: true,
    valid: true,
    errors: [],
    warnings: [{ code: "FORMULA_EMPTY", message: "Fórmula vazia — insira campos ou funções." }],
    diagnostics: [],
    costEstimate: "O(1)",
  });

  let compiled = null;
  let preview = null;
  if (validation.ok && source) {
    compiled = engine.compile(computationDocument);
    preview = engine.evaluate(computationDocument, {
      variables: options.sampleVariables ?? formulaDocument.sampleVariables ?? {},
      studioPartial: {
        clienteId: options.clienteId ?? null,
        moduleId: formulaDocument.moduleId,
        designerId: "formula",
      },
      runtimePartial: {
        clienteId: options.clienteId ?? null,
        moduleId: formulaDocument.moduleId,
        record: options.sampleVariables ?? formulaDocument.sampleVariables ?? {},
      },
    });
  }

  const depEngine = engine.dependencyEngine;
  const dependencies = source
    ? expressionEngine.extractDependencies(ast, formulaDocument.computationDocumentId)
    : [];

  const inferredType = preview?.inferredType ?? engine.typeSystem?.inferExpression?.(ast?.expression, expressionEngine.createContext({
    variables: formulaDocument.sampleVariables ?? {},
  })) ?? "unknown";

  return Object.freeze({
    formulaDocument,
    computationDocument,
    expressionAst: ast,
    validation,
    compiled,
    executionGraph: compiled?.executionGraph ?? null,
    computationGraph: compiled?.computationGraph ?? validation.computationGraph ?? null,
    preview,
    inferredType,
    dependencies,
    dependencyOrder: depEngine.resolveOrder?.() ?? [],
    cycles: depEngine.detectCycles?.() ?? { hasCycle: false },
  });
}

export default syncFormulaPipeline;
