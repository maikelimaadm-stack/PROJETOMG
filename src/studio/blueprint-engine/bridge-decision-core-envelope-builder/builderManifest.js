import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import {
  BUILDER_NAME, BUILDER_VERSION, BUILDER_MODE, SOURCE_FIELDS, CORE_ALLOWLIST, ENVELOPE_FIELDS, PIPELINE_STAGES,
  ISSUE_CODES, RESOURCE_DIMENSIONS, ENVELOPE_INVARIANTS,
} from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Deterministic manifest of the builder implementation surface. FNV internal identity, not crypto. Pure. */
export function createBuilderManifest() {
  const parts = {
    config: { name: BUILDER_NAME, version: BUILDER_VERSION, mode: BUILDER_MODE },
    sourceFields: SOURCE_FIELDS, coreAllowlist: CORE_ALLOWLIST, envelopeFields: ENVELOPE_FIELDS,
    pipelineStages: PIPELINE_STAGES, issueCodes: ISSUE_CODES, resourceDimensions: RESOURCE_DIMENSIONS,
    envelopeInvariants: ENVELOPE_INVARIANTS,
  };
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createDeterministicDigest(parts[k]);
  const overallDigest = createDeterministicDigest({ partDigests });
  return deepFreeze({
    kind: 'builder-manifest',
    builderName: BUILDER_NAME, builderVersion: BUILDER_VERSION, mode: BUILDER_MODE,
    partCount: Object.keys(partDigests).length, partDigests, overallDigest,
    cryptographicIntegrityProvided: false,
  });
}
export default createBuilderManifest;
