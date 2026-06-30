/**
 * Studio Computation Engine — official facade (Program 3.1)
 * Composes Expression, Dependency, Type System, and Evaluation engines.
 */
import {
  STUDIO_COMPUTATION_VERSION,
  OFFICIAL_COMPUTATION_ENGINES,
} from "./contracts/computationContracts.js";
import { createExpressionEngine } from "../expression/createExpressionEngine.js";
import { createDependencyEngine } from "../dependency/createDependencyEngine.js";
import { createTypeSystem } from "../typeSystem/createTypeSystem.js";
import { createEvaluationEngine } from "../evaluation/createEvaluationEngine.js";
import { createComputationDocument, validateComputationDocument } from "./document/computationDocument.js";
import { createComputationGraph, buildComputationGraphFromDocuments } from "./graph/computationGraph.js";
import { createExecutionGraph, compileExecutionGraph } from "./graph/executionGraph.js";
import { compileDocumentToIr, serializeComputationIr } from "./ir/computationIr.js";
import { createStudioContext } from "./context/studioContext.js";
import { createRuntimeContext } from "./context/runtimeContext.js";
import { createComputationContext } from "./context/computationContext.js";
import { createComputationOptimizer } from "./optimizer/computationOptimizer.js";
import { createCostAnalyzer } from "./cost/costAnalyzer.js";
import { createComputationValidationPipeline } from "./pipeline/computationValidationPipeline.js";
import { enrichComputationMetadata } from "./metadata/computationMetadata.js";
import { getFieldComputationModel, listFieldComputationModels } from "./fieldModels/fieldComputationModels.js";

export function createComputationEngine(options = {}) {
  const domainId = options.domainId ?? "studio";
  const expressionEngine = options.expressionEngine ?? createExpressionEngine(options);
  const dependencyEngine = options.dependencyEngine ?? createDependencyEngine({ domainId, cacheKey: domainId });
  const typeSystem = options.typeSystem ?? createTypeSystem(options);
  const evaluationEngine = options.evaluationEngine ?? createEvaluationEngine({
    dependencyEngine,
    typeSystem,
    functionCatalog: expressionEngine.functionCatalog,
  });

  const computationGraph = createComputationGraph();
  const executionGraph = createExecutionGraph();
  const optimizer = createComputationOptimizer();
  const costAnalyzer = createCostAnalyzer();
  const validationPipeline = createComputationValidationPipeline({
    expressionEngine,
    dependencyEngine,
    typeSystem,
    costAnalyzer,
  });

  const compileDocuments = (documents) => {
    const docs = Array.isArray(documents) ? documents : [documents];
    dependencyEngine.graph.clear();
    computationGraph.clear();
    executionGraph.clear();

    const graph = buildComputationGraphFromDocuments(docs, dependencyEngine);
    const irNodes = new Map();
    docs.forEach((doc) => {
      irNodes.set(doc.id, compileDocumentToIr(doc, expressionEngine));
    });

    const optimized = optimizer.optimize(irNodes, graph);
    const execGraph = compileExecutionGraph(graph, optimized.irNodes, dependencyEngine);

    return Object.freeze({
      computationGraph: graph,
      executionGraph: execGraph,
      irNodes: optimized.irNodes,
      metadata: optimized.metadata,
      order: dependencyEngine.resolveOrder(),
    });
  };

  const evaluateDocument = (document, partial = {}) => {
    const compiled = compileDocuments([document]);
    const ir = compiled.irNodes.get(document.id);
    const studioCtx = partial.studio ?? createStudioContext(partial.studioPartial ?? {});
    const runtimeCtx = partial.runtime ?? createRuntimeContext(partial.runtimePartial ?? {});
    const computationCtx = createComputationContext({
      studio: studioCtx,
      runtime: runtimeCtx,
      typeSystem,
      diagnostics: evaluationEngine.diagnostics,
      profiler: evaluationEngine.profiler,
      functionCatalog: expressionEngine.functionCatalog,
      variables: partial.variables ?? runtimeCtx.record ?? {},
    });

    const exprAst = document.ast?.expression
      ? { astVersion: document.ast.astVersion, expression: document.ast.expression }
      : expressionEngine.parse(document.expressionSource ?? "0", { documentId: document.id });

    const variables = partial.variables ?? runtimeCtx.record ?? {};
    const evalResult = evaluationEngine.evaluateExpression({
      ast: exprAst,
      expressionContext: expressionEngine.createContext({ variables }),
      ownerId: document.id,
      strategy: document.evaluationPolicy ?? "lazy",
    });

    return Object.freeze({
      ok: evalResult.ok,
      value: evalResult.value,
      inferredType: evalResult.inferredType,
      ir,
      executionGraph: compiled.executionGraph,
      computationContext: computationCtx,
      diagnostics: evalResult.diagnostics ?? [],
      metadata: enrichComputationMetadata(compiled.computationGraph.snapshot(), { domainId }),
    });
  };

  return Object.freeze({
    version: STUDIO_COMPUTATION_VERSION,
    engines: OFFICIAL_COMPUTATION_ENGINES,
    domainId,
    expressionEngine,
    dependencyEngine,
    typeSystem,
    evaluationEngine,
    computationGraph,
    executionGraph,
    optimizer,
    costAnalyzer,
    validationPipeline,
    createDocument: createComputationDocument,
    validateDocument: validateComputationDocument,
    createStudioContext,
    createRuntimeContext,
    createComputationContext,
    getFieldComputationModel,
    listFieldComputationModels,
    validate(documents, partial) {
      return validationPipeline.validate(documents, partial);
    },
    compile(documents) {
      return compileDocuments(documents);
    },
    evaluate(document, partial) {
      return evaluateDocument(document, partial);
    },
    serializeIr(irNode) {
      return serializeComputationIr(irNode);
    },
    resolveOrder() {
      return dependencyEngine.resolveOrder();
    },
    detectCycles() {
      return dependencyEngine.detectCycles();
    },
    snapshot() {
      return Object.freeze({
        version: STUDIO_COMPUTATION_VERSION,
        domainId,
        computationGraph: computationGraph.snapshot(),
        executionGraph: executionGraph.snapshot(),
        metadata: enrichComputationMetadata(computationGraph.snapshot(), { domainId }),
      });
    },
  });
}

export default createComputationEngine;
