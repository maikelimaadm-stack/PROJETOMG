import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { deepFreeze } from './deepFreeze.js';
/** Aligns future file responsibilities to Core Envelope v2; adds one justified future file. Nothing is created. */
const R = (file, alignedResponsibility) => deepFreeze({ file, alignedResponsibility, createdInThisSlice: false });
export const FUTURE_FILE_MAP_ALIGNMENT = deepFreeze({
  kind: 'future-file-map-alignment',
  originalFutureFileCount: SOURCE_PLAN_TRACEABILITY.originalFutureFileCount, // 27
  realignedFiles: deepFreeze([
    R('normalizeEnvelopeInput.js', 'normalize Core Envelope v2'),
    R('validateEnvelopeShape.js', 'validate Core Envelope v2 shape'),
    R('recomputeAndValidateBridgeDecisionDigest.js', 'recompute digest over bridgeDecisionCore'),
    R('validateSameDecisionProvenance.js', 'digest + core atomicity'),
  ]),
  // One justified addition (versioned; count updated in readiness).
  addedFutureFile: deepFreeze({
    file: 'validateBridgeDecisionCore.js',
    justification: 'exact core field-set completeness/extra validation before digest recompute',
    createdInThisSlice: false, addsToFutureFileCount: 1,
  }),
  alignedFutureFileCount: SOURCE_PLAN_TRACEABILITY.originalFutureFileCount + 1, // 28
  noRuntimeFileCreated: true,
});
export default FUTURE_FILE_MAP_ALIGNMENT;
