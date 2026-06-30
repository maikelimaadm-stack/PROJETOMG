import { validateComputationDocument } from "../document/computationDocument.js";
import { validateComputationIr } from "../ir/computationIr.js";
import { buildComputationGraphFromDocuments } from "../graph/computationGraph.js";
import { enrichComputationMetadata } from "../metadata/computationMetadata.js";

/** Validation Pipeline — official ordered pipeline (Program 3.1) */

export function createComputationValidationPipeline(deps = {}) {
  const {
    expressionEngine,
    dependencyEngine,
    typeSystem,
    costAnalyzer,
  } = deps;

  const validate = (documents, partial = {}) => {
    const errors = [];
    const warnings = [];
    const diagnostics = [];
    const docs = Array.isArray(documents) ? documents : [documents];

    docs.forEach((doc) => {
      const structural = validateComputationDocument(doc);
      if (!structural.valid) {
        structural.errors.forEach((message) => errors.push({ code: "COMP_STRUCTURAL", message, documentId: doc.id }));
      }
    });

    if (errors.length) {
      return buildReport(false, errors, warnings, diagnostics, null);
    }

    docs.forEach((doc) => {
      if (doc.expressionSource && expressionEngine?.parse) {
        try {
          const parsed = expressionEngine.parse(doc.expressionSource, { documentId: doc.id });
          if (expressionEngine.validate) {
            const exprValidation = expressionEngine.validate(parsed);
            if (!exprValidation.valid && !exprValidation.ok) {
              (exprValidation.errors ?? exprValidation.issues ?? []).forEach((issue) => {
                errors.push({
                  code: "COMP_PARSE",
                  message: issue.message ?? String(issue),
                  documentId: doc.id,
                  severity: issue.severity ?? "error",
                });
              });
            }
          }
        } catch (err) {
          errors.push({ code: "COMP_PARSE", message: err?.message ?? "Parse failed.", documentId: doc.id });
        }
      }

      if (typeSystem?.validateValue && doc.typeDescriptor?.kind) {
        const typeCheck = typeSystem.validateValue(null, doc.typeDescriptor.kind);
        if (typeCheck && !typeCheck.valid) {
          typeCheck.issues?.forEach((issue) => {
            warnings.push({ code: "COMP_TYPE_MISMATCH", ...issue, documentId: doc.id });
          });
        }
      }
    });

    const computationGraph = buildComputationGraphFromDocuments(docs, dependencyEngine);
    const cycles = dependencyEngine.detectCycles();
    if (cycles.hasCycle) {
      errors.push({
        code: "COMP_CYCLE",
        message: "Circular dependency detected in computation graph.",
        cycle: cycles.cycle ?? [],
      });
    }

    docs.forEach((doc) => {
      const cost = costAnalyzer?.analyzeDocument?.(doc);
      if (cost && !cost.ok) {
        errors.push({ code: "COMP_COST_EXCEEDED", message: "Cost tier exceeded.", documentId: doc.id });
      }
      cost?.warnings?.forEach((w) => warnings.push({ ...w, documentId: doc.id }));
    });

    const graphCost = costAnalyzer?.analyzeGraph?.(computationGraph);
    const metadata = enrichComputationMetadata(computationGraph.snapshot(), { domainId: partial.domainId ?? "computation" });

    return buildReport(errors.length === 0, errors, warnings, diagnostics, {
      computationGraph,
      graphCost,
      metadata,
      costEstimate: graphCost?.tier ?? "O(1)",
    });
  };

  return Object.freeze({ validate });
}

function buildReport(ok, errors, warnings, diagnostics, extras) {
  return Object.freeze({
    ok,
    valid: ok,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    diagnostics: Object.freeze(diagnostics),
    costEstimate: extras?.costEstimate ?? null,
    computationGraph: extras?.computationGraph ?? null,
    metadata: extras?.metadata ?? null,
  });
}

export default createComputationValidationPipeline;
