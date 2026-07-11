/**
 * Generic Model Runtime — foundation barrel.
 *
 * Pure, React-free, ModeloBase1-free contracts/utilities that a future adapter
 * will use to let ANY MAK model (ModeloBase1, modeloBase2, ..., native/user
 * modules) share the same read/write/persistence/safety/fallback/diagnostics
 * foundation. This slice creates the foundation ONLY — ModeloBase1 is not
 * replaced. Nothing here imports React, the DOM, a backend, Prisma, fetch, the
 * runtime bridge, or ModeloBase1. Dangerous capabilities default to false.
 */

// errors
export { createGenericModelError } from './errors/createGenericModelError.js';
export { GENERIC_MODEL_ERROR_CODES, isGenericModelErrorCode } from './errors/genericModelErrorCodes.js';

// safety
export { isGenericModelPlainObject, safeCloneGenericModel, assertGenericModelPlainObject } from './safety/assertGenericModelPlainObject.js';
export { detectGenericModelUnsafeMarkers, isGenericModelReactElement } from './safety/detectGenericModelUnsafeMarkers.js';
export { sanitizeGenericModelPayload } from './safety/sanitizeGenericModelPayload.js';
export { createGenericModelSafetyPolicy, isGenericModelCapabilityAllowed } from './safety/createGenericModelSafetyPolicy.js';

// fallback / rollback
export { createGenericModelFallback } from './fallback/createGenericModelFallback.js';
export { createGenericModelRollbackPlan } from './fallback/createGenericModelRollbackPlan.js';

// diagnostics
export { createGenericModelDiagnostics } from './diagnostics/createGenericModelDiagnostics.js';

// versioning
export { createGenericModelVersion, GENERIC_MODEL_DEFAULT_CREATED_AT } from './versioning/createGenericModelVersion.js';
export { createGenericModelChecksum } from './versioning/createGenericModelChecksum.js';

// persistence
export { createGenericModelSnapshot, GENERIC_MODEL_SNAPSHOT_SOURCE } from './persistence/createGenericModelSnapshot.js';
export { validateGenericModelSnapshot } from './persistence/validateGenericModelSnapshot.js';
export { createGenericModelInMemoryAdapter } from './persistence/createGenericModelInMemoryAdapter.js';

// write
export { validateGenericModelWritePayload } from './write/validateGenericModelWritePayload.js';
export { createGenericModelWriteContract } from './write/createGenericModelWriteContract.js';

// read
export { validateGenericModelReadModel } from './read/validateGenericModelReadModel.js';
export { createGenericModelReadContract } from './read/createGenericModelReadContract.js';

// model-types (multi-type hardening)
export { GENERIC_MODEL_TYPE_DEFINITIONS, GENERIC_MODEL_KNOWN_TYPES } from './model-types/genericModelTypes.js';
export { createGenericModelTypeRegistry } from './model-types/createGenericModelTypeRegistry.js';
export { validateGenericModelTypeDefinition } from './model-types/validateGenericModelTypeDefinition.js';

// capabilities (multi-type hardening)
export {
  GENERIC_MODEL_CAPABILITY_KEYS,
  GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS,
  GENERIC_MODEL_CAPABILITY_DEFAULTS,
} from './capabilities/genericModelCapabilityDefaults.js';
export { createGenericModelCapabilityMatrix, getGenericModelCapabilities } from './capabilities/createGenericModelCapabilityMatrix.js';
export { validateGenericModelCapabilities } from './capabilities/validateGenericModelCapabilities.js';

// conformance (multi-type hardening)
export { GENERIC_MODEL_CONFORMANCE_RULES, getApplicableConformanceRules } from './conformance/genericModelConformanceRules.js';
export { validateGenericModelAdapterConformance } from './conformance/validateGenericModelAdapterConformance.js';
export { createGenericModelAdapterConformanceReport } from './conformance/createGenericModelAdapterConformanceReport.js';
export { createGenericModelMultiTypeConformanceSuite } from './conformance/createGenericModelMultiTypeConformanceSuite.js';
export { createGenericModelMultiTypeDiagnostics } from './diagnostics/createGenericModelMultiTypeDiagnostics.js';

// contracts
export { createGenericModelRuntimeContract } from './contracts/createGenericModelRuntimeContract.js';
export {
  GENERIC_MODEL_TYPES,
  GENERIC_MODEL_STORAGE_MODES,
  GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS,
  GENERIC_MODEL_BLOCKED_WRITE_OPERATIONS,
  GENERIC_MODEL_CAPABILITIES,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
  GENERIC_MODEL_SAFE_SOURCES,
  GENERIC_MODEL_SCHEMA_VERSION,
  GENERIC_MODEL_NEXT_STEP,
} from './contracts/genericModelContractConstants.js';
