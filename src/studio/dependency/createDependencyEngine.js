/**
 * Studio Dependency Engine — official facade (Program 2.3.3)
 */
import {
  STUDIO_DEPENDENCY_VERSION,
  OFFICIAL_DEPENDENCY_ENGINES,
} from "./contracts/dependencyContracts.js";
import { createDependencyGraph } from "./graph/dependencyGraph.js";
import { createDependencyAnalyzer } from "./analyzer/dependencyAnalyzer.js";
import { createCycleDetection } from "./cycle/cycleDetection.js";
import { createDependencyResolver } from "./resolver/dependencyResolver.js";
import { createDependencyCache } from "./cache/dependencyCache.js";
import { createDependencyInvalidation } from "./invalidation/dependencyInvalidation.js";
import { createImpactAnalyzer } from "./impact/impactAnalyzer.js";
import { createSafeRenameEngine } from "./refactoring/safeRenameEngine.js";
import { createSafeDeleteEngine } from "./refactoring/safeDeleteEngine.js";
import { enrichSnapshotWithMetadata } from "./metadata/dependencyMetadata.js";

export function createDependencyEngine(options = {}) {
  const domainId = options.domainId ?? "studio";
  const cacheKey = options.cacheKey ?? domainId;

  const graph = createDependencyGraph();
  const analyzer = createDependencyAnalyzer();
  const cycleDetection = createCycleDetection();
  const resolver = createDependencyResolver(cycleDetection);
  const cache = createDependencyCache();
  const invalidation = createDependencyInvalidation(cache);
  const impactAnalyzer = createImpactAnalyzer(resolver);
  const safeRename = createSafeRenameEngine({ cycleDetection, resolver, impactAnalyzer });
  const safeDelete = createSafeDeleteEngine({ cycleDetection, resolver, impactAnalyzer });

  return Object.freeze({
    version: STUDIO_DEPENDENCY_VERSION,
    engines: OFFICIAL_DEPENDENCY_ENGINES,
    domainId,
    graph,
    analyzer,
    cycleDetection,
    resolver,
    cache,
    invalidation,
    impactAnalyzer,
    safeRename,
    safeDelete,
    analyze() {
      return analyzer.analyze(graph);
    },
    detectCycles() {
      return cycleDetection.detect(graph);
    },
    resolveOrder() {
      return resolver.resolveOrder(graph);
    },
    resolveDependencies(nodeId) {
      return resolver.resolveDependencies(graph, nodeId);
    },
    analyzeImpact(nodeId, changeType) {
      return impactAnalyzer.analyzeImpact(graph, nodeId, changeType);
    },
    snapshot() {
      const snap = enrichSnapshotWithMetadata(graph.snapshot());
      cache.set(cacheKey, snap, { domainId });
      return snap;
    },
    getCachedSnapshot(key = cacheKey) {
      return cache.get(key)?.snapshot ?? null;
    },
    invalidate(nodeId) {
      return invalidation.invalidateNode(cacheKey, nodeId);
    },
  });
}

export default createDependencyEngine;
