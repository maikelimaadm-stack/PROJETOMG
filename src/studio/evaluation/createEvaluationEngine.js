/**
 * Studio Evaluation Engine — official facade (Program 2.3.5)
 */
import {
  STUDIO_EVALUATION_VERSION,
  OFFICIAL_EVALUATION_ENGINES,
} from "./contracts/evaluationContracts.js";
import { createDependencyEngine } from "../dependency/createDependencyEngine.js";
import { createTypeSystem } from "../typeSystem/createTypeSystem.js";
import { createEvaluationContext } from "./context/evaluationContext.js";
import { createEvaluationSession } from "./session/evaluationSession.js";
import { createEvaluationCache } from "./cache/evaluationCache.js";
import { createEvaluationScheduler } from "./scheduler/evaluationScheduler.js";
import { createEvaluationStrategy } from "./strategy/evaluationStrategy.js";
import { createEvaluationPipeline } from "./pipeline/evaluationPipeline.js";
import { createEvaluationDiagnostics } from "./diagnostics/evaluationDiagnostics.js";
import { createEvaluationProfiler } from "./profiler/evaluationProfiler.js";
import { createEvaluationHooks } from "./hooks/evaluationHooks.js";

export function createEvaluationEngine(options = {}) {
  const dependencyEngine = options.dependencyEngine ?? createDependencyEngine({ domainId: "evaluation" });
  const typeSystem = options.typeSystem ?? createTypeSystem(options);
  const cache = createEvaluationCache();
  const scheduler = createEvaluationScheduler(dependencyEngine);
  const strategyEngine = createEvaluationStrategy();
  const diagnostics = createEvaluationDiagnostics();
  const profiler = createEvaluationProfiler();
  const hooks = createEvaluationHooks();
  const pipeline = createEvaluationPipeline({
    typeSystem,
    cache,
    diagnostics,
    profiler,
    hooks,
    strategyEngine,
    functionCatalog: options.functionCatalog,
  });

  return Object.freeze({
    version: STUDIO_EVALUATION_VERSION,
    engines: OFFICIAL_EVALUATION_ENGINES,
    dependencyEngine,
    typeSystem,
    cache,
    scheduler,
    strategyEngine,
    diagnostics,
    profiler,
    hooks,
    pipeline,
    createContext: createEvaluationContext,
    createSession: createEvaluationSession,
    evaluateExpression(request) {
      return pipeline.evaluateExpression(request);
    },
    evaluateBatch(requests, graph) {
      return pipeline.evaluateBatch(requests, graph ?? dependencyEngine, scheduler);
    },
    invalidateCache(ownerId) {
      cache.invalidate(ownerId);
      return true;
    },
    snapshot() {
      return Object.freeze({
        version: STUDIO_EVALUATION_VERSION,
        cacheSize: cache.size(),
        diagnostics: diagnostics.snapshot(),
        profiling: profiler.snapshot(),
      });
    },
  });
}

export default createEvaluationEngine;
