export {
  STUDIO_GOVERNANCE_VERSION,
  DEPENDENCY_STACK,
  CONSUMER_LAYER_PATHS,
  PUBLIC_API_ENTRY_POINTS,
  INTERNAL_REGISTRY_PATHS,
  FORBIDDEN_FOUNDATION_PATTERNS,
  OFFICIAL_REGISTRY_DIRS,
} from "./studioArchitectureConstants.js";
export {
  resolveStudioLayer,
  getLayerIndex,
  extractImportSpecifiers,
  validateFileDependencies,
  validateDependencyGraph,
  stripSourceComments,
} from "./dependencyGraph.js";
export {
  collectStudioFiles,
  checkDesignerIsolation,
  checkStudioDependencyRules,
  checkRegistryProtection,
  checkPublicApiValidation,
  checkArchitectureBoundaries,
  checkDependencyGraphValidation,
  validateStudioArchitecture,
} from "./architectureRules.js";
